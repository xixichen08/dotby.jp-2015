var React = require('react');
var Router = require('react-router');
var {State} = Router;
var $ = require('jquery');
var MobileDetect = require('mobile-detect');
var isMobile = !!new MobileDetect(navigator.userAgent).mobile();

var Entry = require('./Entry');
var NotFound = require('./NotFound');
var Lang = require('./Lang');


module.exports = React.createClass({

    mixins: [State, Lang],

    getInitialState() {
        return {
            loading: true,
            entry: null
        }
    },

    getEntry() {
        var data = {
            'filter[name]': this.getParams().post,
            lang: this.context.lang
        };
        $.getJSON('/wp-json/posts', data).done(result => {
            this.setState({loading: false, entry: result[0]});
        }).fail(() => {
            this.setState({loading: false});
        });
    },

    componentDidMount() {
        this.getEntry();
    },

    componentWillReceiveProps() {
        this.getEntry();
    },

    render() {
        return (
            <div>
                <hr className="line"/>
                {this.state.loading ? '' :
                    this.state.entry ? <Entry entry={this.state.entry} single={isMobile}/> : <NotFound/>}
            </div>
        );
    }
});
