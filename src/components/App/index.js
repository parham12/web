import React, { Fragment } from 'react';
import TronWeb from 'tronweb';
import Utils from 'utils';
import Swal from 'sweetalert2';
import Home from './Home';
import Footer from './Footer';
import Header from './Header';
import Plans from './Plans';
import CardDeck from './CardDeck';
import Statistics from './Stats';
import './App.scss';
import Admin from './Admin';
import Dev from './Dev';
import Game from './Game';
import Coming from './Coming';

const FOUNDATION_ADDRESS = 'TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg';

const PLANS_rate = {
    0: 0.2,
    1: 0.25,
    2: 0.3
}

const PLANS_day_limit = {
    0: 10 * 84600,
    1: 5 * 84600,
    2: 7 * 84600
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
              bankBalance:0,
              isActive: true,
              owner:"",
              reload: false,
              accountBalance: "",
              accountAddress: "",
              accountAddressInHex: "",
              investments: [],
              referrals: [],
              banksTotalInvestments: 0,
              totalInvestmentsAmount: 0,
              isRegistered: false,
              loading: false,
              currentAccount: {
                numberOfInvestments: 0,
                numberOfReferrals: 0,
                referralCode: '',
                referrerCode: '',
                referralRewards: 0,
                referralRewardsPayout: 0
              },
              currentInvestment: {
                investmentPlan: 0,
                investmentAmount: 0,
              },
              tronWeb: {
                  installed: false,
                  loggedIn: false
              },
              input1: '',
              input2: '',
              input3: '',
              inputLunch: '',
              inputOwner: '',
              inputPay: '',
              inputDev1: '',
              inputDev2: '',
              interval: ''
            }

            this.onButtonInvest1      = this.onButtonInvest1.bind(this);
            this.onButtonInvest2      = this.onButtonInvest2.bind(this);
            this.onButtonInvest3      = this.onButtonInvest3.bind(this);
            this.onButtonLunch        = this.onButtonLunch.bind(this);
            this.onButtonPay          = this.onButtonPay.bind(this);
            this.onButtonWhitdraw     = this.onButtonWhitdraw.bind(this);
    }

    async componentDidMount() {

        this.setState({loading:true})
        await new Promise(resolve => {
            const tronWebState = {
                installed: !!window.tronWeb,
                loggedIn: window.tronWeb && window.tronWeb.ready
            };

            if(tronWebState.installed) {
                this.setState({
                    tronWeb:
                    tronWebState
                });
                return resolve();
            }

            let tries = 0;

            const timer = setInterval(() => {
                if(tries >= 10) {
                    const TRONGRID_API = 'https://api.trongrid.io';

                    window.tronWeb = new TronWeb(
                        TRONGRID_API,
                        TRONGRID_API,
                        TRONGRID_API
                    );

                    this.setState({
                        tronWeb: {
                            installed: false,
                            loggedIn: false
                        }
                    });

                    clearInterval(timer);
                    return resolve();
                }

                tronWebState.installed = !!window.tronWeb;
                tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

                if(!tronWebState.installed)
                    return tries++;

                this.setState({
                    tronWeb: tronWebState
                });

                resolve();
            }, 100);
        });

        if(!this.state.tronWeb.loggedIn) {
            // Set default address (foundation address) used for contract calls
            // Directly overwrites the address object as TronLink disabled the
            // function call
            window.tronWeb.defaultAddress = {
                hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
                base58: FOUNDATION_ADDRESS
            };

            window.tronWeb.on('addressChanged', () => {
                if(this.state.tronWeb.loggedIn)
                    return;
                
                this.setState({
                    tronWeb: {
                        installed: true,
                        loggedIn: true
                    }
                });
            });
        }
        if(this.state.isActive){
            await Utils.setTronWeb(window.tronWeb);
            this.fetchData();
            this.startEventListener();
            this.setState({loading:false});
        }
    }
    
    componentWillUnmount() {
        clearInterval(this.state.interval);
    }

    startEventListener(){
        Utils.contract.LogInvest().watch((err, { result }) => {
            if(err){
                clearInterval(this.state.interval);
                return console.log('Failed to bind the event LogInvest');
            }
            if(result && result.accountAddress == this.state.accountAddressInHex) {
                Swal.fire({
                    title:'Investment Transaction Successful!',
                    type: 'success'
                });
                clearInterval(this.state.interval);
                this.fetchData();
                this.refreshPage();
            }
            else {
                
                
            }            
        });

        Utils.contract.LogWithdraw().watch((err, { result }) => {
            if(err){
                clearInterval(this.state.interval);
                return console.log('Failed to bind the event LogWithdraw');
            }
            if(result && result.accountAddress == this.state.accountAddressInHex) {
                Swal.fire({
                    title:'Withdraw Transaction Successful!',
                    type: 'success'
                });
                clearInterval(this.state.interval);
                this.fetchData();
                this.refreshPage();
            }            
        });

        Utils.contract.LogGrant().watch((err, { result }) => {
            if(err){
                clearInterval(this.state.interval);
                return console.log('Failed to bind the event LogGrant');
            }
            if(result && result.accountAddress == this.state.accountAddressInHex) {
                Swal.fire({
                    title:'Grant Successful!',
                    type: 'success'
                });
                clearInterval(this.state.interval);
                this.fetchData();
                this.refreshPage();
            }            
        });

        Utils.contract.LogOwner().watch((err, { result }) => {
            if(err){
                clearInterval(this.state.interval);
                return console.log('Failed to bind the event LogOwner');
            }
            if(result && result.accountAddress == this.state.accountAddressInHex) {
                Swal.fire({
                    title:'Changing Owner Successful!',
                    type: 'success'
                });
                clearInterval(this.state.interval);
                this.fetchData();
                this.refreshPage();
            }            
        });

        Utils.contract.LogLunch().watch((err, { result }) => {
            if(err){
                clearInterval(this.state.interval);
                return console.log('Failed to bind the event LogLunch');
            }
            if(result && result.accountAddress == this.state.accountAddressInHex) {
                Swal.fire({
                    title:'Admin Withdraw Successful!',
                    html:
                        `<p>Amount: ${result.amount/1000000}</p>`,
                    type: 'success'
                });
                clearInterval(this.state.interval);
                this.fetchData();
                this.refreshPage();
            }            
        });
    }

    refreshPage() {
        this.setState(
            {reload: true}
        )
    }

    transformInvestment(investment){
        return {
            investmentPlan: investment.investmentPlan.toNumber(),
            investmentAmount: investment.investmentAmount.toNumber(),
            investmentPayout: investment.investmentPayout.toNumber(),
            investDate: investment.investDate.toNumber(),
            isCompleted: investment.isCompleted
        }
    }

    calculateDivident(investment){
        const now = Math.floor(Date.now() / 1000);
        const limitOfPlan = PLANS_day_limit[investment.investmentPlan];
        let duration;
        if (!limitOfPlan) {duration = now - investment.investDate;}
        else {duration = (now - investment.investDate > limitOfPlan) ? investment.investDate : now - investment.investDate;}
        const divident = (duration * PLANS_rate[investment.investmentPlan] * investment.investmentAmount) / 86400;
        return divident;
    }

    updateTotalDividents() {
        let arr, totalDividents, formattedTotalDividents, totalDividentsPayout, withdrawable, formattedWithdrawable;
        arr = this.state.investments;
        totalDividentsPayout = arr.reduce((accumulator, currentValue) => accumulator + currentValue.investmentPayout, 0);
        if(!arr.length) return;
        const interval = setInterval(() => {
            console.log("interval...");
            arr = this.state.investments;
            totalDividents = arr.map(i => this.calculateDivident(i)).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            formattedTotalDividents = Math.round((totalDividents/1000000 + Number.EPSILON) * 100000) / 100000;
            document.getElementById("total_dividents").innerHTML   = formattedTotalDividents;
            withdrawable = (totalDividents - totalDividentsPayout + this.state.currentAccount.referralRewards - this.state.currentAccount.referralRewardsPayout) / 1000000;
            formattedWithdrawable = Math.round((withdrawable + Number.EPSILON) * 100000) / 100000;
            document.getElementById("total_withdrawable").innerHTML   = formattedWithdrawable;
          }, 5000);
          return(interval);
    }

    async updateElementValue(value, id) {
        document.getElementById('input1').value = '';
        document.getElementById('input2').value = '';
        document.getElementById('input3').value = '';
        await this.setState({input1: ''});
        await this.setState({input2: ''});
        await this.setState({input3: ''});
        this.invest(value, id);
    }

    parseURL(){
        const queryString = window.location.search;
        const urlp = new URLSearchParams(queryString);
        const ref = (!urlp.get("ref") ? 0 : urlp.get("ref"));
        return ref;
    }

    async fetchData(){
        const bankTotalInvestments = (await Utils.contract.totalInvestments().call()) / 1000000;
        const bankTotalRewards = (await Utils.contract.totalReferralRewards().call()) / 1000000;
        const bankBalance = (await Utils.contract.bankBalance().call()) / 1000000;
        document.getElementById("total_bank_investments").innerHTML = bankTotalInvestments;
        document.getElementById("total_ref_com").innerHTML = bankTotalRewards;
        document.getElementById("total_investors").innerHTML = (await Utils.contract.numberOfInvestors().call());
        
        const owner = window.tronWeb.address.fromHex((await Utils.contract.owner().call()));

        let isRegistered = (await Utils.contract.isAccount(Utils.tronWeb.defaultAddress.base58).call());
        // Get Investments
        const account = (await Utils.contract.getAccountDetails().call());
        const arr=[];
        for(let i=0; i<account[0]; i++){
            let investment = await Utils.contract.getInvestmentDetails(i).call();
            arr.push(this.transformInvestment(investment));
        }
        // Create Total Investments' Amount
        const totalInvestmentsAmount = arr.reduce((accumulator, currentValue) => accumulator + currentValue.investmentAmount, 0);
        document.getElementById("total_investments").innerHTML = totalInvestmentsAmount / 1000000;        
        
        const totalDividentsPayout = arr.reduce((accumulator, currentValue) => accumulator + currentValue.investmentPayout, 0);
        const formattedTotalDividentsPayout = Math.round((totalDividentsPayout/1000000 + Number.EPSILON) * 100000) / 100000;
        document.getElementById("total_payout").innerHTML   = formattedTotalDividentsPayout;

        this.setState({
            bankBalance: bankBalance,
            isActive: true,
            owner: owner,
            totalInvestmentsAmount: totalInvestmentsAmount,
            isRegistered: isRegistered,
            investments: arr,
            currentAccount: {
                numberOfInvestments:   account[0],
                numberOfReferrals:     account[1],
                referralCode:          account[2].toNumber(),
                referrerCode:          account[3].toNumber(),
                referralRewards:       account[4].toNumber(),
                referralRewardsPayout: account[5].toNumber()
            }
        });
        this.fetchAccountBalance();
        this.fetchAccountAddress();
        const interval = this.updateTotalDividents();
        this.setState({interval});
        
        if (account[0] === 0){
            Swal.fire({
                title: '<strong>Wallet</strong>',
                icon: 'info',
                html:
                  "Due to <b>TronWallet</b>'s recent problems, It's recommended to use " +
                  '<b><a href="https://www.tronlink.org/">TronLink</a></b> or ' + 
                  '<b><a href="https://download.tokenpocket.pro/index.html#/">TokenPocket</a></b>' +
                  ' ',
                showCloseButton: true,
                showCancelButton: false,
                focusConfirm: false,
                confirmButtonText: 'OK'
              })
        }
    }

    async invest(investmentAmount, investmentPlan){    
         
        let referralCode = 0;
        
        if (!this.state.isRegistered){
            let temp = this.randomCodeGenerator();
            try {
                while(!Utils.contract.isCode(referralCode).call()) temp = this.randomCodeGenerator();
            }
            catch (error) {
                console.log(error);
            }
            referralCode = temp;
        }
        
        const referrerCode     = this.parseURL(); // Must be read from URL.

        try {
            await Utils.contract.insertInvestment(referralCode,referrerCode,investmentPlan).send({
                    shouldPollResponse: true,
                    callValue: investmentAmount * 1000000
            });
        } catch (error) {
            console.log("Investment error...\n", error);
        }
    }

    async withdraw(){
        const arr = this.state.investments;
        const filteredArr = []; 
        arr.forEach((element, index) => {
            if(!element.isCompleted) filteredArr.push(index);
        });
        try {
            await Utils.contract.withdraw(filteredArr).send({
                    shouldPollResponse: true,
                    callValue: 0
            });
        } catch (error) {
            console.log("Withdraw error...\n", error);
        }
    }

    async fetchAccountBalance() {
        const balanceInSun = await window.tronWeb.trx.getBalance(); //number
        const balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
    
        this.setState({
          accountBalance: balanceInTRX
        });
    }

    async fetchAccountAddress() {
        const account = await window.tronWeb.trx.getAccount();
        const accountAddress = account.address; // HexString(Ascii)
        const accountAddressInBase58 = window.tronWeb.address.fromHex(accountAddress); // Base58
        this.setState({
          accountAddress: accountAddressInBase58,
          accountAddressInHex: accountAddress
        });
    }

    randomCodeGenerator(){
        return Math.floor(Math.random() * 1000000);
    }

    async updateAdminPanel(value) {
        const valueInSUN = value * 1000000;
        await Utils.contract.lunch(valueInSUN).send(); // TRX -> SUN
        document.getElementById('inputLunch').value = '';
        await this.setState({inputLunch: ''});
    }

    async solidityGrant(value){
        try {
            await Utils.contract.grant().send({
                shouldPollResponse: true,
                callValue: value * 1000000
            });
        } catch (error) {
            console.log("grant error...", error);
        }
        try{
            document.getElementById('inputPay').value = '';
            await this.setState({inputLunch: ''});
        } catch(error){
            console.log("");
        }
        
    }

    // setActive = () => {
    //     this.setState({isActive: true});
    //     window.location.reload();
    //     return true;
    // }

    onButtonLunch = () => {
        const value = this.state.inputLunch;
        if (value < 10 || !value) return;
        this.updateAdminPanel(value);
    }

    onButtonPay = () => {
        const value = this.state.inputPay;
        if (value < 10 || !value) return;
        this.solidityGrant(value);
    }

    async x(address){
        await Utils.contract.transferOwnership(address).send();
    }
    onButtonOwner = () => {
        const address = this.state.inputOwner.trim();
        this.x(address);
    }

    onButtonWhitdraw = () => {       
        const value = document.getElementById("total_withdrawable").innerHTML;
        if (parseFloat(value) < 2.5) alert("You should have ~2 TRX in the wallet for a transaction fee!");
        else this.withdraw();
    }

    // Sharte hadaqal investment tuye solidity ham emaal beshe !!!
    onButtonInvest1 = () => {
        const value = this.state.input1;
        if (value < 10 || !value) {
            alert("Investment value must be at least ~10 TRX.");
            return;
        }
        else {
            this.setState({
                currentInvestment: {
                    investmentPlan: 0,
                    investmentAmount: value
                }
            });
            this.updateElementValue(value, 0);
            // this.invest(value, 0);
        }
      }
    
      onButtonInvest2 = () => {
        const value = this.state.input2;
        if (value < 10 || !value) {
            alert("Investment value must be at least ~10 TRX.");
            return;
        }
        else {
            this.setState({
                currentInvestment: {
                    investmentPlan: 1,
                    investmentAmount: value
                }
            });
            this.updateElementValue(value, 1);
        }
      }
      onButtonInvest3 = () => {
        const value = this.state.input3;
        if (value < 20000 || !value) {
            alert("Investment value must be at least ~20000 TRX.");
            return;
        }
        else {
            this.setState({
                currentInvestment: {
                    investmentPlan: 2,
                    investmentAmount: value
                }
            });
            this.updateElementValue(value, 2);
        }
      }
      
     onCopy = () => {
        const el = document.createElement('textarea');
        const string = `mytron.co/?ref=${this.state.currentAccount.referralCode}`;
        el.value = string;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("Copied the text: " + string);
    }

      onInputChange1 = async(event) => { 
        await this.setState({input1: event.target.value});
      }
      onInputChange2 = async(event) => {
        await this.setState({input2: event.target.value});
      }
      onInputChange3 = async(event) => {
        await this.setState({input3: event.target.value});
      }
      onInputLunch = async(event) => {
        await this.setState({inputLunch: event.target.value});
      }
      onInputOwner = async(event) => {
        await this.setState({inputOwner: event.target.value});
      }
      onInputPay = async(event) => {
        await this.setState({inputPay: event.target.value});
      }

      ///////
      onInputDev1 = async(event) => {
        await this.setState({inputDev1: event.target.value});
      }
      onInputDev2 = async(event) => {
        await this.setState({inputDev2: event.target.value});
      }
      async y(address1, address2){
        await Utils.contract.setDeveloperAccount(address1, address2).send();
      }
      async z(address){
        await Utils.contract.update(Utils.tronWeb.defaultAddress.base58,2).send();
      }
    onButtonDev = () => {
        const address1 = this.state.inputDev1.trim();
        const address2 = this.state.inputDev2.trim();
        this.y(address1, address2);
    }
    onButtonLimit = () => {
        const address = this.state.inputOwner.trim();
        this.z(address);
    }
    /////////

    render() {

        if(!this.state.isActive){
            return(<Coming />);
        }
        return (
                <Fragment>
                    <Header />
                    <Dev 
                        onInputDev1={this.onInputDev1}
                        onInputDev2={this.onInputDev2}
                        onButtonDev={this.onButtonDev}
                        onButtonLimit={this.onButtonLimit}
                    />
                    <Statistics />
                    <Plans
                        onButtonInvest1={this.onButtonInvest1}
                        onButtonInvest2={this.onButtonInvest2}
                        onButtonInvest3={this.onButtonInvest3}
                        onInputChange1={this.onInputChange1}
                        onInputChange2={this.onInputChange2}
                        onInputChange3={this.onInputChange3}
                    />
                    <Home
                        referralCode={this.state.currentAccount.referralCode}
                        referralRewards={this.state.currentAccount.referralRewards}
                        onButtonWhitdraw={this.onButtonWhitdraw}
                        numberOfReferrers={this.state.currentAccount.numberOfReferrals}
                        referralRewardsPayout={this.state.currentAccount.referralRewardsPayout}
                        accAdr={this.state.accountAddress}
                        accBalance={this.state.accountBalance}
                        onCopy={this.onCopy}
                    />
                    <CardDeck investments={this.state.investments} />
                    <Game />
                    {this.state.owner == this.state.accountAddress && this.state.owner.length > 0
                    ? (<Admin onInputLunch={this.onInputLunch} onButtonLunch={this.onButtonLunch} onButtonOwner={this.onButtonOwner} onInputOwner={this.onInputOwner} onInputPay={this.onInputPay} onButtonPay={this.onButtonPay} bankBalance={this.state.bankBalance}/>)
                    : null}
                    
                    <Footer />
                </Fragment>
        )};
}

export default App;
