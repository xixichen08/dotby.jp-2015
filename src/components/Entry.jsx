var React = require('react/addons');
var cx = React.addons.classSet;
var Router = require('react-router');
var {Navigation} = Router;
var $ = require('jquery');
var MobileDetect = require('mobile-detect');
var isMobile = !!new MobileDetect(navigator.userAgent).mobile();
var moment = require('moment');
moment.locale('en');

var Link = require('./Link');


module.exports = React.createClass({

    mixins: [Navigation],

    _onClickMember(e) {
        e.preventDefault();
        this.transitionTo($(e.currentTarget).attr('href'));
    },

    _onResize() {
        var width = $(this.refs.entry.getDOMNode()).outerWidth();
        var height = Math.floor(width / 960 * 430);
        var size = {'background-size': `${width}px ${height}px`};
        $(this.refs.entry.getDOMNode()).css(size);
        $(this.refs.inner.getDOMNode()).css(size).css('padding-top', height - (isMobile ? 17 : 34));

        if (this._iframes) {
            width = $(this.refs.body.getDOMNode()).width();
            this._iframes.each((index, element) => {
                var el = $(element);
                el.attr({width: width, height: width / el.data('aspect')});
            });
        }
    },

    componentDidMount() {
        if (this.refs.credit) {
            this._memberLink = $('a', this.refs.credit.getDOMNode()).not('[href^="http"]').click(this._onClickMember);
        }
        var needResize = !!this.props.entry.featured_image;
        var iframes = $('iframe', this.getDOMNode());
        if (iframes.size() > 0) {
            iframes.each((index, element) => {
                var el = $(element);
                el.data({aspect: el.attr('width') / el.attr('height')});
            });
            this._iframes = iframes;
            needResize = true;
        }
        $('img', this.refs.body.getDOMNode()).each((index, element) => {
            $(element).attr({width: null, height: null});
        });
        if (needResize) {
            $(window).on('resize', this._onResize);
            this._onResize();
        }
    },

    componentWillUnmount() {
        if (this._memberLink) {
            this._memberLink.off();
        }
        $(window).off('resize', this._onResize);
    },

    render() {
        var entry = this.props.entry;
        var style = {backgroundImage: entry.featured_image ? `url(${entry.featured_image.source})` : ''};
        if (entry.meta.credit) {
            var credit = entry.meta.credit.split('\n').map((item) => {
                [title, name, link] = item.split(',');
                title = title.trim();
                name = name.trim();
                if (link) link = link.trim();
                if (link) {
                    return <span key={title + name + link}>{title}: <a href={link} target="_blank" dangerouslySetInnerHTML={{__html: name}}/></span>;
                } else {
                    return <span key={title + name + link}>{title}: <span dangerouslySetInnerHTML={{__html: name}}/></span>
                }
            });
        }
        return (
            <div className={cx({entry: true, 'with-image': entry.featured_image})} ref="entry" style={style}>
                <div className={cx({inner: true, hover: this.props.single})} ref="inner" style={style}>
                    <h1 className="title" dangerouslySetInnerHTML={{__html: entry.title}}/>
                    <span className="date"><Link to={`/post/${entry.slug}/`}>{moment(entry.date_gmt).format('LL')}</Link></span>
                    <div className="body" ref="body">
                        <div dangerouslySetInnerHTML={{__html: entry.content}}/>
                        {entry.terms.category[0].slug == 'work' ? (
                            <table>
                                <tbody>
                                {entry.meta.awards ? (
                                    <tr className="award">
                                        <th>AWARD</th>
                                        <td>
                                            {entry.meta.awards.map(item => item ? <img key={item} src={`/assets/${item}.png`}/> : false)}
                                        </td>
                                    </tr>
                                ) : null}
                                    <tr className="credit">
                                        <th>CREDIT</th>
                                        <td ref="credit">{credit}</td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
});
