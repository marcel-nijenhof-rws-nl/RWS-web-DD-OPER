const React = require('react');
const ReactDOM = require('react-dom');
const Snackbar = require('@material-ui/core/Snackbar').default;
const MuiAlert = require('@material-ui/lab/Alert').default;

class CustomSnackbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {openSnackbar: false};
    }

    handleOpen() {
        this.setState({openSnackbar: true});
    }

    handleClose() {
        this.setState({openSnackbar: false});
        setTimeout(() => {
            ReactDOM.unmountComponentAtNode(document.querySelector("#snackbar-holder"));
        }, 500);
    }

    render() {
        return <Snackbar open={this.state.openSnackbar} onClose={this.handleClose.bind(this)}
                         autoHideDuration={5000}>
            <MuiAlert elevation={6} variant="filled" onClose={this.handleClose.bind(this)}
                      severity={this.props.severityStrength}>
                {this.props.message}
            </MuiAlert>
        </Snackbar>
    }

    componentDidMount() {
        this.handleOpen();
    }
}

module.exports = CustomSnackbar;
