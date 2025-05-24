#[starknet::contract]
mod YieldVault {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use core::traits::TryInto;
    use core::option::OptionTrait;
    use core::array::ArrayTrait;

    // Constants
    const PRECISION: u256 = 10000; // 100.00%

    // Storage
    #[storage]
    struct Storage {
        // Token addresses
        btc_token: ContractAddress,
        wbtc_token: ContractAddress,
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,

        // Protocol addresses
        vesu_market: ContractAddress,
        babylon_staking: ContractAddress,
        ekubo_pool: ContractAddress,
        pragma_oracle: ContractAddress,

        // Strategy allocation percentages (out of PRECISION)
        vesu_allocation: u256,
        babylon_allocation: u256,
        ekubo_allocation: u256,

        // User deposits
        user_deposits: LegacyMap<ContractAddress, u256>,
        total_deposits: u256,

        // Admin
        owner: ContractAddress,
        rebalance_threshold: u256, // Minimum APY difference to trigger rebalance
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposit: Deposit,
        Withdraw: Withdraw,
        Rebalance: Rebalance,
        RewardHarvested: RewardHarvested,
    }

    #[derive(Drop, starknet::Event)]
    struct Deposit {
        user: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Withdraw {
        user: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Rebalance {
        vesu_allocation: u256,
        babylon_allocation: u256,
        ekubo_allocation: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardHarvested {
        reward_token: ContractAddress,
        amount: u256,
        converted_btc_amount: u256,
    }

    // Constructor
    #[constructor]
    fn constructor(
        ref self: ContractState,
        btc_token: ContractAddress,
        wbtc_token: ContractAddress,
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,
        vesu_market: ContractAddress,
        babylon_staking: ContractAddress,
        ekubo_pool: ContractAddress,
        pragma_oracle: ContractAddress,
        owner: ContractAddress,
    ) {
        self.btc_token.write(btc_token);
        self.wbtc_token.write(wbtc_token);
        self.lbtc_token.write(lbtc_token);
        self.strk_token.write(strk_token);
        self.vesu_market.write(vesu_market);
        self.babylon_staking.write(babylon_staking);
        self.ekubo_pool.write(ekubo_pool);
        self.pragma_oracle.write(pragma_oracle);
        self.owner.write(owner);
        
        // Default allocation: 40% Vesu, 30% Babylon, 30% Ekubo
        self.vesu_allocation.write(4000);
        self.babylon_allocation.write(3000);
        self.ekubo_allocation.write(3000);
        
        // Default rebalance threshold: 2% (200 basis points)
        self.rebalance_threshold.write(200);
    }

    // External functions
    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        let btc_token = self.btc_token.read();
        
        // Transfer BTC from user to vault
        IERC20Dispatcher { contract_address: btc_token }.transfer_from(
            caller, get_contract_address(), amount
        );
        
        // Update user deposit
        let current_deposit = self.user_deposits.read(caller);
        self.user_deposits.write(caller, current_deposit + amount);
        
        // Update total deposits
        let total = self.total_deposits.read();
        self.total_deposits.write(total + amount);
        
        // Allocate funds according to strategy
        self._allocate_funds(amount);
        
        // Emit event
        self.emit(Deposit { user: caller, amount });
    }

    #[external(v0)]
    fn withdraw(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        let user_deposit = self.user_deposits.read(caller);
        
        assert(user_deposit >= amount, 'Insufficient balance');
        
        // Update user deposit
        self.user_deposits.write(caller, user_deposit - amount);
        
        // Update total deposits
        let total = self.total_deposits.read();
        self.total_deposits.write(total - amount);
        
        // Withdraw funds from strategies
        self._withdraw_from_strategies(amount);
        
        // Transfer BTC to user
        let btc_token = self.btc_token.read();
        IERC20Dispatcher { contract_address: btc_token }.transfer(caller, amount);
        
        // Emit event
        self.emit(Withdraw { user: caller, amount });
    }

    #[external(v0)]
    fn rebalance(ref self: ContractState) {
        // Only owner can rebalance
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can rebalance');
        
        // Get current APYs from Pragma oracle
        let (vesu_apy, babylon_apy, ekubo_apy) = self._get_current_apys();
        
        // Calculate optimal allocation based on APYs
        let (new_vesu, new_babylon, new_ekubo) = self._calculate_optimal_allocation(
            vesu_apy, babylon_apy, ekubo_apy
        );
        
        // Check if rebalance is needed (if difference exceeds threshold)
        let current_vesu = self.vesu_allocation.read();
        let current_babylon = self.babylon_allocation.read();
        let current_ekubo = self.ekubo_allocation.read();
        
        let threshold = self.rebalance_threshold.read();
        
        let should_rebalance = 
            self._abs_diff(current_vesu, new_vesu) > threshold ||
            self._abs_diff(current_babylon, new_babylon) > threshold ||
            self._abs_diff(current_ekubo, new_ekubo) > threshold;
            
        if should_rebalance {
            // Update allocation percentages
            self.vesu_allocation.write(new_vesu);
            self.babylon_allocation.write(new_babylon);
            self.ekubo_allocation.write(new_ekubo);
            
            // Perform actual rebalancing of funds
            self._rebalance_funds();
            
            // Emit event
            self.emit(Rebalance { 
                vesu_allocation: new_vesu,
                babylon_allocation: new_babylon,
                ekubo_allocation: new_ekubo
            });
        }
    }

    #[external(v0)]
    fn harvest_rewards(ref self: ContractState) {
        // Only owner can harvest rewards
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can harvest');
        
        // Harvest rewards from all strategies
        self._harvest_vesu_rewards();
        self._harvest_babylon_rewards();
        self._harvest_ekubo_rewards();
    }

    #[external(v0)]
    fn get_user_balance(self: @ContractState, user: ContractAddress) -> u256 {
        self.user_deposits.read(user)
    }

    #[external(v0)]
    fn get_total_deposits(self: @ContractState) -> u256 {
        self.total_deposits.read()
    }

    #[external(v0)]
    fn get_current_allocation(self: @ContractState) -> (u256, u256, u256) {
        (
            self.vesu_allocation.read(),
            self.babylon_allocation.read(),
            self.ekubo_allocation.read()
        )
    }

    // Internal functions
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _allocate_funds(ref self: ContractState, amount: u256) {
            let vesu_amount = amount * self.vesu_allocation.read() / PRECISION;
            let babylon_amount = amount * self.babylon_allocation.read() / PRECISION;
            let ekubo_amount = amount - vesu_amount - babylon_amount; // Remainder to avoid rounding issues
            
            // Allocate to Vesu lending market
            if vesu_amount > 0 {
                self._deposit_to_vesu(vesu_amount);
            }
            
            // Allocate to Babylon staking via LBTC
            if babylon_amount > 0 {
                self._deposit_to_babylon(babylon_amount);
            }
            
            // Allocate to Ekubo liquidity pool
            if ekubo_amount > 0 {
                self._deposit_to_ekubo(ekubo_amount);
            }
        }
        
        fn _withdraw_from_strategies(ref self: ContractState, amount: u256) {
            let vesu_amount = amount * self.vesu_allocation.read() / PRECISION;
            let babylon_amount = amount * self.babylon_allocation.read() / PRECISION;
            let ekubo_amount = amount - vesu_amount - babylon_amount; // Remainder to avoid rounding issues
            
            // Withdraw from Vesu lending market
            if vesu_amount > 0 {
                self._withdraw_from_vesu(vesu_amount);
            }
            
            // Withdraw from Babylon staking
            if babylon_amount > 0 {
                self._withdraw_from_babylon(babylon_amount);
            }
            
            // Withdraw from Ekubo liquidity pool
            if ekubo_amount > 0 {
                self._withdraw_from_ekubo(ekubo_amount);
            }
        }
        
        fn _rebalance_funds(ref self: ContractState) {
            // Implementation would withdraw all funds and reallocate according to new percentages
            // For simplicity, this is a placeholder
            let total = self.total_deposits.read();
            
            // Withdraw all funds from strategies
            self._withdraw_from_vesu(total);
            self._withdraw_from_babylon(total);
            self._withdraw_from_ekubo(total);
            
            // Reallocate according to new percentages
            self._allocate_funds(total);
        }
        
        fn _get_current_apys(self: @ContractState) -> (u256, u256, u256) {
            // In a real implementation, this would query the Pragma oracle
            // For simplicity, returning placeholder values
            (1500, 800, 1800) // 15%, 8%, 18%
        }
        
        fn _calculate_optimal_allocation(
            self: @ContractState, 
            vesu_apy: u256, 
            babylon_apy: u256, 
            ekubo_apy: u256
        ) -> (u256, u256, u256) {
            // Simple strategy: allocate proportionally to APY
            // More sophisticated strategies could be implemented
            let total_apy = vesu_apy + babylon_apy + ekubo_apy;
            
            let vesu_alloc = vesu_apy * PRECISION / total_apy;
            let babylon_alloc = babylon_apy * PRECISION / total_apy;
            let ekubo_alloc = PRECISION - vesu_alloc - babylon_alloc; // Remainder to ensure sum = PRECISION
            
            (vesu_alloc, babylon_alloc, ekubo_alloc)
        }
        
        fn _abs_diff(self: @ContractState, a: u256, b: u256) -> u256 {
            if a > b {
                a - b
            } else {
                b - a
            }
        }
        
        // Strategy-specific functions (placeholders)
        fn _deposit_to_vesu(ref self: ContractState, amount: u256) {
            // Implementation would interact with Vesu lending market
        }
        
        fn _withdraw_from_vesu(ref self: ContractState, amount: u256) {
            // Implementation would withdraw from Vesu lending market
        }
        
        fn _deposit_to_babylon(ref self: ContractState, amount: u256) {
            // Implementation would convert BTC to LBTC and stake on Babylon
        }
        
        fn _withdraw_from_babylon(ref self: ContractState, amount: u256) {
            // Implementation would unstake from Babylon and convert LBTC back to BTC
        }
        
        fn _deposit_to_ekubo(ref self: ContractState, amount: u256) {
            // Implementation would add liquidity to Ekubo BTC/WBTC pool
        }
        
        fn _withdraw_from_ekubo(ref self: ContractState, amount: u256) {
            // Implementation would remove liquidity from Ekubo BTC/WBTC pool
        }
        
        fn _harvest_vesu_rewards(ref self: ContractState) {
            // Implementation would harvest rewards from Vesu and convert to BTC
        }
        
        fn _harvest_babylon_rewards(ref self: ContractState) {
            // Implementation would harvest staking rewards from Babylon and convert to BTC
        }
        
        fn _harvest_ekubo_rewards(ref self: ContractState) {
            // Implementation would harvest trading fees and STRK rewards from Ekubo and convert to BTC
        }
    }
}
