import React from 'react';
import '../Search.css';
import axios from 'axios';
import Loader from '../loader.gif';
import md5 from 'md5';

class Search extends React.Component{
	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			results: {},
			loading: false,
			message: '',
			totalResults: 0,
			totalPages: 0,
			selectedOption:'title',
		};

		
		this.cancel = '';
	}

	onValueChange = (event) => {
		this.setState({
		  selectedOption: event.target.value
		});
	}
	

	handleOnInputChange = ( event ) => {
		const query = event.target.value;
		if ( ! query ) {
			this.setState( { query, results: {}, message: '', totalPages: 0, totalResults: 0 } );
		} else {
			this.setState( { query, loading: true, message: '' }, () => {
				this.fetchSearchResults( this.state.selectedOption , query );
			} );
		}
	};
	fetchSearchResults = (cat,  query ) => {
		let t=Math.floor(Date.now() / 1000);
		let hash = md5(t+"18ca0ab414e5ed19a67ad938e99feb9464f41f9b"+"2562fce9dcdc57f92edc9393bd153d02");
		let param="title";
		let  searchUrl = "";
		if(cat=="title"){
			param="title="+query;
			searchUrl = `http://gateway.marvel.com/v1/public/comics?ts=${t}&apikey=2562fce9dcdc57f92edc9393bd153d02&hash=${hash}&formatType=comic&${param}`;
		}else if(cat=="Characters"){
			param="name="+query;
			searchUrl = `http://gateway.marvel.com/v1/public/characters?ts=${t}&apikey=2562fce9dcdc57f92edc9393bd153d02&hash=${hash}&${param}`;
		
		}else{
			param="title="+query;
			searchUrl = `http://gateway.marvel.com/v1/public/series?ts=${t}&apikey=2562fce9dcdc57f92edc9393bd153d02&hash=${hash}&${param}`;
		}
		console.log(searchUrl);
		if( this.cancel ) {
			this.cancel.cancel();
		}
		console.log(searchUrl);
		this.cancel = axios.CancelToken.source();

		axios.get( searchUrl, {
			cancelToken: this.cancel.token
		} )
			.then( res => {
				const total = res.data.data.total;
				const totalPagesCount = this.getPageCount( total, 20 );
				const resultNotFoundMsg = ! res.data.data.results.length
										? 'There are no more search results. Please try a new search'
										: '';
				this.setState( {
					results: res.data.data.results,
					message: resultNotFoundMsg,
					totalResults: total,
					totalPages: totalPagesCount,
					loading: false
				} ) 
			} )
			.catch( error => {
				if ( axios.isCancel(error) || error ) {
					this.setState({
						loading: false,
						message: 'Failed to fetch the data. Please check network'
					})
				}
			} )
	};

	/**
	 * Get the Total Pages count.
	 *
	 * @param total
	 * @param denominator Count of results per page
	 * @return {number}
	 */
	getPageCount = ( total, denominator ) => {
		const divisible	= 0 === total % denominator;
		const valueToBeAdded = divisible ? 0 : 1;
		return Math.floor( total/denominator ) + valueToBeAdded;
	};

	/**
	 * Fetch results according to the prev or next page requests.
	 *
	 * @param {String} type 'prev' or 'next'
	 */
	onChangeValue(event) {
		console.log(event.target.value);
	  }

	renderSearchResults = () => {
		const { results } = this.state;
	 
		if ( Object.keys( results ).length && results.length ) {
			return (
				 
				<div className="results-container">
					
					{ results.map( result => {
						return (
							 
							 <div key={result.id} className="movie_card">
								<h6 className="image-username">{result.title}</h6>
								<div className="image-wrapper">
									<img className="image" src={ result.thumbnail.path+ '/standard_xlarge.'+ result.thumbnail.extension } alt={`${result.title} image`}/>
								</div>
							</div> 
							
							)
						})
					}

				</div>
				 
			)
		}
	};


	render(){

		const { query, loading, message,  totalPages } = this.state;

			return(
			<div className="container">
				{/*	Heading*/}
				<h2 className="heading">Live Search: React Application</h2>
				
				{/*Select Category  */}
				<div className="radio" >
				<label>
					<input
					type="radio"
					value="title"
					checked={this.state.selectedOption === "title"}
					onChange={this.onValueChange}
					/>
					Title
				</label>
				
				<label>
					<input
					type="radio"
					value="Characters"
					checked={this.state.selectedOption === "Characters"}
					onChange={this.onValueChange}
					/>
					Characters
				</label>
				 
				<label>
					<input
					type="radio"
					value="Series"
					checked={this.state.selectedOption === "Series"}
					onChange={this.onValueChange}
					/>
					Series
				</label>
				</div>

				{/* Search Input*/}
				<label className="search-label" htmlFor="search-input">
					<input
						type="text"
						name="query"
						value={ this.state.query }
						id="search-input"
						placeholder="Search..."
						onChange={this.handleOnInputChange}
					/>
					<i className="fa fa-search search-icon" aria-hidden="true"/>
				</label>

				{/*	Error Message*/}
				{this.state.message && <p className="message">{ this.state.message }</p>}

				{/*	Loader*/}
				<img src={ Loader } className={`search-loading ${ this.state.loading ? 'show' : 'hide' }`} alt="loader"/>
				
							
				{/*	Result*/}
				{ this.renderSearchResults() }

			
			</div>
		);
	}

}

export default Search