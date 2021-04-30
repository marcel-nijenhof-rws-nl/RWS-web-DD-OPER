import BookmarksRoundedIcon from '@material-ui/icons/BookmarksRounded';
import HomeIcon from '@material-ui/icons/HomeRounded';
import TimeLineIcon from '@material-ui/icons/TimelineRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import BugReportRoundedIcon from '@material-ui/icons/BugReportRounded';

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon  from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";

const React = require('react');
const ReactDOM = require('react-dom');
const CustomSnackbar = require('./CustomSnackbar.jsx');

class NavigationMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
        }

        this.toggleDrawer = this.toggleDrawer.bind(this);
        this.navigateHome = this.navigateHome.bind(this);
        this.navigateCharts = this.navigateCharts.bind(this);
        this.navigateBookmarks = this.navigateBookmarks.bind(this);
        this.navigateSettings = this.navigateSettings.bind(this);
        this.logout = this.logout.bind(this);
        this.openGithubIssues = this.openGithubIssues.bind(this);
    }

    toggleDrawer() {
        this.setState({open: !this.state.open})
    }

    navigateHome() {
        window.location.href = "/start";
    }

    navigateCharts() {
        window.location.href = "/charts";
    }

    navigateBookmarks() {
        window.location.href = "/bookmarks";
    }

    navigateSettings() {
        window.location.href = "/settings";
    }

    logout() {
        localStorage.removeItem("session-token");
        ReactDOM.render(<CustomSnackbar message="U bent afgemeld"
                                        severityStrength="info"/>, document.querySelector("div.snackbar-holder"));
    }

    openGithubIssues() {
        window.open("https://github.com/SaleemTheKing/RWS-web-DD-OPER/issues/new?assignees=SaleemTheKing&labels=bug&template=bug_report.md&title=", "_blank");
    }

    render() {
        return <div className="menu">
            <List>
                <ListItem onClick={this.navigateHome} style={{cursor: "pointer"}}>
                    <ListItemIcon><HomeIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Home"}/>
                </ListItem>
                <ListItem onClick={this.navigateCharts} style={{cursor: "pointer"}}>
                    <ListItemIcon><TimeLineIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Grafieken"}/>
                </ListItem>
                <ListItem onClick={this.navigateBookmarks} style={{cursor: "pointer"}}>
                    <ListItemIcon><BookmarksRoundedIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Bladwijzers"}/>
                </ListItem>
                <ListItem onClick={this.navigateSettings} style={{cursor: "pointer"}}>
                    <ListItemIcon><SettingsRoundedIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Instellingen"}/>
                </ListItem>

                <Divider/>

                <ListItem onClick={this.logout} style={{cursor: "pointer"}}>
                    <ListItemIcon><ExitToAppRoundedIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Afmelden"}/>
                </ListItem>
                <ListItem onClick={this.openGithubIssues} style={{cursor: "pointer"}}>
                    <ListItemIcon><BugReportRoundedIcon fontSize={"large"} style={{color: 'rgba(255,255,255,0.8)'}}/></ListItemIcon>
                    <ListItemText primary={"Rapporteer"}/>
                </ListItem>
            </List>
        </div>
    }
}

module.exports = NavigationMenu;
