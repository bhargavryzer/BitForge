#[starknet::contract]
mod BitForge {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::access::ownable::OwnableComponent;
    use core::traits::TryInto;
    use core::option::OptionTrait;
    use core::array::ArrayTrait;

    // Components
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    
    // Interfaces
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableTransferImpl = OwnableComponent::OwnableTransferImpl<ContractState>;
    
    // Storage
    #[storage]
    struct Storage {
        // Component storage
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        
        // Token addresses
        btc_token: ContractAddress,
        wbtc_token: ContractAddress,
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,
        
        // Protocol addresses
        yield_vault: ContractAddress,
        staking_module: ContractAddress,
        liquidity_pool: ContractAddress,
        
        // Strategy parameters
        rebalance_frequency: u64, // In seconds
        last_rebalance_time: u64,
        auto_compound_enabled: bool,
        
        // User data
        user_deposits: LegacyMap<ContractAddress, u256>,
        total_deposits: u256,
        
        // Fee configuration
        performance_fee: u256, // Basis points (e.g., 1000 = 10%)
        fee_recipient: ContractAddress,
    }

    // Events
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnableEvent: OwnableComponent::Event,
        Deposit: Deposit,
        Withdraw: Withdraw,
        Rebalance: Rebalance,
        PerformanceFeeCollected: PerformanceFeeCollected,
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
    struct PerformanceFeeCollected {
        amount: u256,
        recipient: ContractAddress,
    }

    // Constructor
    #[constructor]
    fn constructor(
        ref self: ContractState,
        btc_token: ContractAddress,
        wbtc_token: ContractAddress,
        lbtc_token: ContractAddress,
        strk_token: ContractAddress,
        yield_vault: ContractAddress,
        staking_module: ContractAddress,
        liquidity_pool: ContractAddress,
        owner: ContractAddress,
        fee_recipient: ContractAddress,
    ) {
        // Initialize ownable
        self.ownable.initializer(owner);
        
        // Set token addresses
        self.btc_token.write(btc_token);
        self.wbtc_token.write(wbtc_token);
        self.lbtc_token.write(lbtc_token);
        self.strk_token.write(strk_token);
        
        // Set protocol addresses
        self.yield_vault.write(yield_vault);
        self.staking_module.write(staking_module);
        self.liquidity_pool.write(liquidity_pool);
        
        // Set default parameters
        self.rebalance_frequency.write(86400); // Daily rebalance
        self.last_rebalance_time.write(0);
        self.auto_compound_enabled.write(true);
        
        // Set fee configuration
        self.performance_fee.write(1000); // 10% performance fee
        self.fee_recipient.write(fee_recipient);
    }

    // External functions
    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        let btc_token = self.btc_token.read();
        
        // Transfer BTC from user to this contract
        IERC20Dispatcher { contract_address: btc_token }.transfer_from(
            caller, get_contract_address(), amount
        );
        
        // Update user deposit
        let current_deposit = self.user_deposits.read(caller);
        self.user_deposits.write(caller, current_deposit + amount);
        
        // Update total deposits
        let total = self.total_deposits.read();
        self.total_deposits.write(total + amount);
        
        // Forward to yield vault
        IERC20Dispatcher { contract_address: btc_token }.approve(
            self.yield_vault.read(), amount
        );
        
        // Call yield vault deposit function
        // In a real implementation, this would call the yield vault's deposit function
        
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
        
        // Withdraw from yield vault
        // In a real implementation, this would call the yield vault's withdraw function
        
        // Collect performance fee if applicable
        let fee_amount = self._collect_performance_fee(amount);
        let user_amount = amount - fee_amount;
        
        // Transfer BTC to user
        let btc_token = self.btc_token.read();
        IERC20Dispatcher { contract_address: btc_token }.transfer(caller, user_amount);
        
        // Emit event
        self.emit(Withdraw { user: caller, amount: user_amount });
    }

    #[external(v0)]
    fn rebalance(ref self: ContractState) {
        // Check if it's time to rebalance
        let current_time = starknet::get_block_timestamp();
        let last_rebalance = self.last_rebalance_time.read();
        let frequency = self.rebalance_frequency.read();
        
        if current_time >= last_rebalance + frequency {
            // Call yield vault rebalance function
            // In a real implementation, this would call the yield vault's rebalance function
            
            // Get new allocation from yield vault
            // In a real implementation, this would get the new allocation from the yield vault
            let vesu_allocation = 4000; // 40%
            let babylon_allocation = 3000; // 30%
            let ekubo_allocation = 3000; // 30%
            
            // Update last rebalance time
            self.last_rebalance_time.write(current_time);
            
            // Emit event
            self.emit(Rebalance { 
                vesu_allocation,
                babylon_allocation,
                ekubo_allocation
            });
        }
    }

    #[external(v0)]
    fn compound_rewards(ref self: ContractState) {
        // Check if auto-compound is enabled
        assert(self.auto_compound_enabled.read(), 'Auto-compound disabled');
        
        // Call liquidity pool compound function
        // In a real implementation, this would call the liquidity pool's compound function
    }

    #[external(v0)]
    fn set_rebalance_frequency(ref self: ContractState, frequency: u64) {
        // Only owner can set rebalance frequency
        self.ownable.assert_only_owner();
        
        self.rebalance_frequency.write(frequency);
    }

    #[external(v0)]
    fn set_auto_compound(ref self: ContractState, enabled: bool) {
        // Only owner can set auto-compound
        self.ownable.assert_only_owner();
        
        self.auto_compound_enabled.write(enabled);
    }

    #[external(v0)]
    fn set_performance_fee(ref self: ContractState, fee: u256) {
        // Only owner can set performance fee
        self.ownable.assert_only_owner();
        
        // Ensure fee is reasonable (max 20%)
        assert(fee <= 2000, 'Fee too high');
        
        self.performance_fee.write(fee);
    }

    #[external(v0)]
    fn set_fee_recipient(ref self: ContractState, recipient: ContractAddress) {
        // Only owner can set fee recipient
        self.ownable.assert_only_owner();
        
        self.fee_recipient.write(recipient);
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
    fn get_current_apy(self: @ContractState) -> u256 {
        // In a real implementation, this would calculate the current APY based on all strategies
        // For simplicity, returning a placeholder value
        2000 // 20.00%
    }

    // Internal functions
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _collect_performance_fee(ref self: ContractState, amount: u256) -> u256 {
            let fee_percentage = self.performance_fee.read();
            let fee_amount = amount * fee_percentage / 10000;
            
            if fee_amount > 0 {
                // Transfer fee to recipient
                let btc_token = self.btc_token.read();
                let recipient = self.fee_recipient.read();
                IERC20Dispatcher { contract_address: btc_token }.transfer(recipient, fee_amount);
                
                // Emit event
                self.emit(PerformanceFeeCollected { 
                    amount: fee_amount,
                    recipient
                });
            }
            
            fee_amount
        }
    }
}
