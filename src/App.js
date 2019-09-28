import React, { Component } from 'react'
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';


const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const proxyurl = 'https://cors-anywhere.herokuapp.com/' // used to bypass CORS controls

class App extends Component {
  state = {
    merchantList: [],
    merchantData: [],
    yearlyRevenues: [],
    share: [],
    years: [],
    activeYear: {},
    activeMerchant: {},
    errorState: undefined,
    isLoading: true,
  }

  // Populate Table with Months and Market Share if share is initialized
  handleTable = () => {
    const { share } = this.state
    if(share.length){
      return <table><thead>{share}</thead></table>
    }
    return <div></div>
  }

  // Get Revenue by merchant and active year when using selecting new merchant
  handleSelectChange = event => {
    const merchant = event.target.value
    this.setState({isLoading: true}, () => {
      if (merchant) {
        const { activeYear } = this.state
        const url = `https://fox-test-api.herokuapp.com/api/revenue/${activeYear}/${merchant}` // site that doesn’t send Access-Control-*
        fetch(proxyurl + url)
          .then(result => result.json())
          .then(result => {
            this.setState({
              merchantData: result,
              activeMerchant: merchant,
              share: this.calculateMarketShare(result),
              isLoading: false,
            })
          })
          .catch((error) => {
            this.setState({isLoading: false, errorState: error})
            console.log('Can’t access ' + url + ' response. Blocked by browser?')}
          )
      }
    })

  }

  // change active year when selecting a new year then update market share
  handleSelectYear = event => {
    const year = event.target.value
    this.setState({isLoading: true}, () => {
      this.setState({
        activeYear: year,
      })
      this.getYearlyRevenues(year) // update yearlY revenue with new year to prepare calculateMarketShare function
      const merchant = this.state.activeMerchant
      if (merchant.length) {
        const url = `https://fox-test-api.herokuapp.com/api/revenue/${year}/${merchant}` // site that doesn’t send Access-Control-*
        fetch(proxyurl + url)
          .then(result => result.json())
          .then(result => {
            this.setState({
              merchantData: result,
              share: this.calculateMarketShare(result),
              isLoading: false,
            })
          })
          .catch((error) =>
            {this.setState({isLoading: false, errorState: error})
            console.log('Can’t access ' + url + ' response. Blocked by browser?')}
          )
      }})
  }

  // receive merchant revenues in argument and calculate MarketShare dividing each merchant month sellings with total Months sellings in yearlyRevenues
  calculateMarketShare = merchantYearlyRevenues => {
    const newShare = this.state.yearlyRevenues.map((entry, index) => {
      const data = Math.round((merchantYearlyRevenues.values[index].value / entry.value) * 100)
      return (
        <tr key ={`shareData${index}`}>
          <th>{MONTHS[index]}</th>
          <th>
            {data}
            {'%'}
          </th>
        </tr>
      )
    })
    newShare.unshift( // add headers to the table
      <tr key={'headers'}>
        <th>{'Period'}</th>
        <th>{'Market share'}</th>
      </tr>
    )
    return newShare
  }

  // get totalYearlyRevenues by year
  getYearlyRevenues = year => {
    const totalRevenuesByYearURL = `https://fox-test-api.herokuapp.com/api/revenue/${year}` // site that doesn’t send Access-Control-*
    fetch(proxyurl + totalRevenuesByYearURL)
      .then(result => result.json())
      .then(result => {
        this.setState({
          yearlyRevenues: result.values,
        })
      })
      .catch(() =>
        console.log('Can’t access ' + totalRevenuesByYearURL + ' response. Blocked by browser?')
      )
  }
  // Code is invoked after the component is mounted/inserted into the DOM tree.
  componentDidMount() {
    const merchantsUrl = 'https://fox-test-api.herokuapp.com/api/merchants' // site that doesn’t send Access-Control-*
    const yearsUrl = 'https://fox-test-api.herokuapp.com/api/years'
    fetch(proxyurl + merchantsUrl)
      .then(result => result.json())
      .then(result => {
        this.setState({
          merchantList: result,
        })
      })
      .catch(() =>
        console.log('Can’t access ' + merchantsUrl + ' response. Blocked by browser?')
      )
    fetch(proxyurl + yearsUrl)
      .then(result => result.json())
      .then(result => {
        this.setState({
          years: result,
          activeYear: result[0], // Initialize activeYear with the first year available
        })
        return result
      })
      .then(result => {
        this.getYearlyRevenues(result[0])
      this.setState({isLoading: false})}) // Initialize YearlyRevenues with the first year available
      .catch((error) =>{
        this.setState({isLoading: false, errorState: error})
        console.log('Can’t access ' + yearsUrl + ' response. Blocked by browser?')}
      )
  }



  render() {
    const {
      merchantList,
      years,
      errorState,
      isLoading,
    } = this.state
    const merchantListFormated = merchantList.map((entry, index) => {
      return (
        <option key={index} value={entry}>
          {entry}
        </option>
      )
    })
    merchantListFormated.unshift(
      <option key={'nomerchant'} value={undefined}>
        {'Select a Merchant'}
      </option>
    )

    const yearList = years.map((entry, index) => {
      return (
        <option key={index} value={entry}>
          {entry}
        </option>
      )
    })
    if(isLoading) return <div><i className="fas fa-circle-notch fa-spin fa-2x"></i></div>
    return (
      <div>
        {errorState && <div>{errorState.message}</div>}
         <label>{'Merchant list : '}</label>
        <select onChange={this.handleSelectChange}> {merchantListFormated}</select>
        <label>{' Years : '}</label>
        <select onChange={this.handleSelectYear}> {yearList} </select>
        <div>{this.handleTable()}</div>
      </div>
    )
  }
}

export default App
