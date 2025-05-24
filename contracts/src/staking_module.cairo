#[starknet::contract]
mod StakingModule {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use core::traits::TryInto;
    use core::option::OptionTrait;
    use core::array::ArrayTrait;

    // Storage
    #[storage]
    struct Storage {
        // Token addresses
        btc_token: ContractAddress,
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,
        
        // Protocol addresses
        babylon_staking: ContractAddress,
        ekubo_amm: ContractAddress,
        yield_vault: ContractAddress,
        
        // Staking data
        total_staked: u256,
        
        // Admin
        owner: ContractAddress,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Staked: Staked,
        Unstaked: Unstaked,
        RewardHarvested: RewardHarvested,
    }

    #[derive(Drop, starknet::Event)]
    struct Staked {
        amount: u256,
        lbtc_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Unstaked {
        lbtc_amount: u256,
        btc_amount: u256,
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
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,
        babylon_staking: ContractAddress,
        ekubo_amm: ContractAddress,
        yield_vault: ContractAddress,
        owner: ContractAddress,
    ) {
        self.btc_token.write(btc_token);
        self.lbtc_token.write(lbtc_token);
        self.strk_token.write(strk_token);
        self.babylon_staking.write(babylon_staking);
        self.ekubo_amm.write(ekubo_amm);
        self.yield_vault.write(yield_vault);
        self.owner.write(owner);
        self.total_staked.write(0);
    }

    // External functions
    #[external(v0)]
    fn stake(ref self: ContractState, btc_amount: u256) {
        // Only yield vault can call this function
        let caller = get_caller_address();
        assert(caller == self.yield_vault.read(), 'Only vault can stake');
        
        // Convert BTC to LBTC (1:1 ratio assumed for simplicity)
        let lbtc_amount = self._convert_btc_to_lbtc(btc_amount);
        
        // Stake LBTC on Babylon
        self._stake_lbtc(lbtc_amount);
        
        // Update total staked
        let total = self.total_staked.read();
        self.total_staked.write(total + lbtc_amount);
        
        // Emit event
        self.emit(Staked { amount: btc_amount, lbtc_amount });
    }

    #[external(v0)]
    fn unstake(ref self: ContractState, lbtc_amount: u256) {
        // Only yield vault can call this function
        let caller = get_caller_address();
        assert(caller == self.yield_vault.read(), 'Only vault can unstake');
        
        // Ensure we have enough staked
        let total = self.total_staked.read();
        assert(total >= lbtc_amount, 'Insufficient staked amount');
        
        // Unstake LBTC from Babylon
        self._unstake_lbtc(lbtc_amount);
        
        // Convert LBTC back to BTC
        let btc_amount = self._convert_lbtc_to_btc(lbtc_amount);
        
        // Update total staked
        self.total_staked.write(total - lbtc_amount);
        
        // Transfer BTC back to yield vault
        let btc_token = self.btc_token.read();
        let yield_vault = self.yield_vault.read();
        IERC20Dispatcher { contract_address: btc_token }.transfer(yield_vault, btc_amount);
        
        // Emit event
        self.emit(Unstaked { lbtc_amount, btc_amount });
    }

    #[external(v0)]
    fn harvest_rewards(ref self: ContractState) {
        // Only owner or yield vault can harvest rewards
        let caller = get_caller_address();
        assert(
            caller == self.owner.read() || caller == self.yield_vault.read(),
            'Unauthorized'
        );
        
        // Claim staking rewards from Babylon
        let (reward_token, reward_amount) = self._claim_babylon_rewards();
        
        // Convert rewards to BTC using Ekubo
        let btc_amount = self._convert_rewards_to_btc(reward_token, reward_amount);
        
        // Transfer BTC to yield vault
        let btc_token = self.btc_token.read();
        let yield_vault = self.yield_vault.read();
        IERC20Dispatcher { contract_address: btc_token }.transfer(yield_vault, btc_amount);
        
        // Emit event
        self.emit(RewardHarvested { 
            reward_token,
            amount: reward_amount,
            converted_btc_amount: btc_amount
        });
    }

    #[external(v0)]
    fn get_total_staked(self: @ContractState) -> u256 {
        self.total_staked.read()
    }

    #[external(v0)]
    fn get_estimated_apy(self: @ContractState) -> u256 {
        // In a real implementation, this would query Babylon for current staking APY
        // For simplicity, returning a placeholder value
        800 // 8.00%
    }

    // Internal functions
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _convert_btc_to_lbtc(ref self: ContractState, btc_amount: u256) -> u256 {
            // In a real implementation, this would interact with Lombard protocol
            // For simplicity, assuming 1:1 conversion
            let btc_token = self.btc_token.read();
            let lbtc_token = self.lbtc_token.read();
            
            // Transfer BTC to Lombard (simulated)
            // In reality, this would call Lombard's conversion function
            
            // Receive LBTC (simulated)
            // In reality, this would be handled by Lombard's conversion function
            
            btc_amount // 1:1 ratio for simplicity
        }
        
        fn _convert_lbtc_to_btc(ref self: ContractState, lbtc_amount: u256) -> u256 {
            // In a real implementation, this would interact with Lombard protocol
            // For simplicity, assuming 1:1 conversion
            let lbtc_token = self.lbtc_token.read();
            let btc_token = self.btc_token.read();
            
            // Transfer LBTC to Lombard (simulated)
            // In reality, this would call Lombard's conversion function
            
            // Receive BTC (simulated)
            // In reality, this would be handled by Lombard's conversion function
            
            lbtc_amount // 1:1 ratio for simplicity
        }
        
        fn _stake_lbtc(ref self: ContractState, lbtc_amount: u256) {
            // In a real implementation, this would interact with Babylon staking contract
            // For simplicity, this is a placeholder
            let lbtc_token = self.lbtc_token.read();
            let babylon_staking = self.babylon_staking.read();
            
            // Approve Babylon staking contract to spend LBTC
            IERC20Dispatcher { contract_address: lbtc_token }.approve(babylon_staking, lbtc_amount);
            
            // Call Babylon staking function (simulated)
            // In reality, this would call Babylon's staking function
        }
        
        fn _unstake_lbtc(ref self: ContractState, lbtc_amount: u256) {
            // In a real implementation, this would interact with Babylon staking contract
            // For simplicity, this is a placeholder
            let babylon_staking = self.babylon_staking.read();
            
            // Call Babylon unstaking function (simulated)
            // In reality, this would call Babylon's unstaking function
        }
        
        fn _claim_babylon_rewards(ref self: ContractState) -> (ContractAddress, u256) {
            // In a real implementation, this would interact with Babylon staking contract
            // For simplicity, assuming rewards are in STRK token
            let strk_token = self.strk_token.read();
            let babylon_staking = self.babylon_staking.read();
            
            // Call Babylon claim rewards function (simulated)
            // In reality, this would call Babylon's claim rewards function
            
            // For simplicity, assume we received 100 STRK tokens
            let reward_amount = 100_000_000_000_000_000_000; // 100 STRK with 18 decimals
            
            (strk_token, reward_amount)
        }
        
        fn _convert_rewards_to_btc(
            ref self: ContractState,
            reward_token: ContractAddress,
            reward_amount: u256
        ) -> u256 {
            // In a real implementation, this would swap tokens using Ekubo AMM
            // For simplicity, assuming a fixed conversion rate
            let ekubo_amm = self.ekubo_amm.read();
            
            // Approve Ekubo to spend reward tokens
            IERC20Dispatcher { contract_address: reward_token }.approve(ekubo_amm, reward_amount);
            
            // Call Ekubo swap function (simulated)
            // In reality, this would call Ekubo's swap function
            
            // For simplicity, assume 100 STRK = 0.01 BTC
            let btc_amount = 1_000_000; // 0.01 BTC with 8 decimals
            
            btc_amount
        }
    }
}
