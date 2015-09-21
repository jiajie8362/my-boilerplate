const React = window.React = require('react');
const MyTitle = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired
  },

  render: function() {
    return <h1> {this.props.title} </h1>;
  }
});

React.render(
  <MyTitle title={"123"} />,
  document.getElementById('app')
);
