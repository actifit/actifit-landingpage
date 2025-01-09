async claimRewards() {
    //function handles claiming STEEM rewards
    if (!localStorage.getItem('std_login')) {
      //sample link: https://steemconnect.com/sign/claim-reward-balance?account=sdsf&reward_steem=33&reward_sbd=2342&reward_vests=23432
      var link = this.$steemconnect.sign('claim-reward-balance', {
        account: this.user.account.name,
        reward_steem: this.claimSTEEM,
        reward_sbd: this.claimSBD,
        reward_vests: this.claimVests,
        auto_return: true,
      }, window.location.origin + '/wallet?op=claim rewards&status=success');
  
      window.open(link);
      await this.waitAndFetchBalance();
    } else {
      this.claimRewardsProcess = true;
      let chainLnk = await this.setProperNode();
      console.log('claiming rewards');
      
      let cstm_params = {
        "account": this.user.account.name,
        "reward_steem": this.claimSTEEM,
        "reward_sbd": this.claimSBD,
        "reward_vests": this.claimVests
      };
      
      if (this.cur_bchain == 'HIVE') {
        cstm_params = {
          "account": this.user.account.name,
          "reward_hive": this.claimSTEEM,
          "reward_hbd": this.claimSBD,
          "reward_vests": this.claimVests
        };
      } else if (this.cur_bchain == 'BLURT') {
        cstm_params = {
          "account": this.user.account.name,
          "reward_blurt": this.claimSTEEM,
          "reward_vests": this.claimVests
        };
      }
      
      let res = await this.processTrxFunc('claim_reward_balance', cstm_params);
      
      if (res.success) {
        this.confirmCompletion('claimrewards', 0, res);
        this.isClaimableDataAvailableTEMP = false;
        await this.waitAndFetchBalance();
      }
    }
  },
  
  // Add this new method to handle the delayed balance fetch
  async waitAndFetchBalance() {
    let attempts = 0;
    const maxAttempts = 2; // Will try twice over 6 seconds
    
    const checkBalance = async () => {
      try {
        await this.fetchUserData();
        attempts++;
        
        if (attempts < maxAttempts) {
          // Wait another 3 seconds before trying again
          setTimeout(checkBalance, 3000);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
  
    // Start the first check after 3 seconds
    setTimeout(checkBalance, 3000);
  }