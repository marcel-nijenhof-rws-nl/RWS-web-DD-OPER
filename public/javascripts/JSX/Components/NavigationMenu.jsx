const React = require('react');

class NavigationMenu extends React.Component {
    render() {
        return <div className="menu">
            <ul>
                <li>
                    <a href="/start">
                        <img className="menu-icon" src="assets/images/home-white-18dp.svg"
                             alt="Grafieken"/>
                        <p>Home</p>
                    </a>
                </li>
                <li>
                    <a href="/charts">
                        <img className="menu-icon" src="assets/images/show_chart-white-18dp.svg"
                             alt="Grafieken"/>
                        <p>Grafieken</p>
                    </a>
                </li>
                <li>
                    <a href="/bookmarks">
                        <img className="menu-icon" src="assets/images/bookmarks-white-18dp.svg"
                             alt="Grafieken"/>
                        <p>Bladwijzers</p>
                    </a>
                </li>
                <li>
                    <a href="/settings">
                        <img className="menu-icon" src="assets/images/settings-white-18dp.svg"
                             alt="Grafieken"/>
                        <p>Instellingen</p>
                    </a>
                </li>
                <li>
                    <a href="/" onClick={logout}>
                        <img className="menu-icon" src="assets/images/logout-white-18dp.svg"
                             alt="Afmelden"/>
                        <p>Afmelden</p>
                    </a>
                </li>
                <li>
                    <a onClick={openGithubIssues}>
                        <img className="menu-icon" src="assets/images/bug_report_white_18dp.svg"
                             alt="Rapporteer"/>
                        <p>Rapporteer</p>
                    </a>
                </li>
            </ul>
        </div>
    }
}

function logout() {
    localStorage.removeItem("session-token");
    alert("U bent afgemeld.");
}

function openGithubIssues() {
    window.open("https://github.com/SaleemTheKing/RWS-web-DD-OPER/issues/new?assignees=SaleemTheKing&labels=bug&template=bug_report.md&title=", "_blank");
}

module.exports = NavigationMenu;
