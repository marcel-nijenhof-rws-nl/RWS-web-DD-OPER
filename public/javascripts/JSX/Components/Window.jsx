import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable'
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MinimizeRoundedIcon from '@material-ui/icons/MinimizeRounded';
import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import QuantityChart from "./QuantityChart.jsx";
import WindowContainer from "./WindowContainer.jsx";
import {updateWindows} from "../maps.jsx";
import Chart3D2Q from "./3DChart2Q.jsx";

export default class Window extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            elevation: 0,
            container: this.props.children,
            minimised: false,
        };

        this.setElevation = this.setElevation.bind(this);
        this.removeWindow = this.removeWindow.bind(this);
        this.minimise = this.minimise.bind(this);
        this.maximise = this.maximise.bind(this);
    }

    setElevation(elevation) {
        this.setState({elevation: elevation});
    }

    minimise() {
        this.setState({minimised: true});
    }

    maximise() {
        this.setState({minimised: false});
    }

    removeWindow() {
        let children = this.props.container;
        if (this.props.multiple && !this.props.quantity.includes("waveenergy") && !this.props.quantity.includes("wavedirection")) {
            let child = children.find(child => child.marker.displayName === this.props.marker.displayName && child.quantity[0] === this.props.quantity[0] && child.quantity[1] === this.props.quantity[1]);
            let index = children.indexOf(child);
            children.splice(index, 1);
        } else {
            let child = children.find(child => child.marker.displayName === this.props.marker.displayName && child.quantity[0] === this.props.quantity);
            let index = children.indexOf(child);
            children.splice(index, 1);
        }

        updateWindows(children);

        ReactDOM.render(<WindowContainer children={children}/>, document.querySelector("div.window-container"));
    }

    componentDidMount() {
    }

    render() {
        let name = this.props.marker.displayName;
        let quantity = this.props.quantity.toString();

        name = name.replace('.', '-');
        quantity = quantity.replace(',', '-');

        let id = "d-" + quantity + "-" + name;

        return (
            <Draggable handle={"#" + id}>
                <Paper className={this.state.minimised ? "draggable-window-minimised" : "draggable-window"}
                       onPointerUp={() => this.setElevation(0)}
                       onPointerDown={() => this.setElevation(10)}
                       elevation={this.state.elevation}
                >
                    <div className={"window-container-grid"}>
                        <div style={{
                            gridColumn: '2',
                            gridRow: '1',
                        }}>
                            <div hidden={!this.state.minimised}>
                                <IconButton>
                                    <FullscreenRoundedIcon onClick={this.maximise}/>
                                </IconButton>
                            </div>
                            <div hidden={this.state.minimised}
                                 style={{position: 'absolute', right: 0}}
                            >
                                <IconButton>
                                    <MinimizeRoundedIcon onClick={this.minimise}/>
                                </IconButton>
                                <IconButton onClick={this.removeWindow}>
                                    <CloseRoundedIcon/>
                                </IconButton>
                            </div>
                        </div>
                        <div id={id}
                             className={this.state.minimised ? "draggable-window-title__minimized" : "draggable-window-title"}
                             style={{
                                 gridColumn: '1',
                                 gridRow: '1',
                             }}>
                            <Typography variant={"h6"}
                                        className={this.state.minimised ? "window-title__minimised" : "window-title"}
                            >
                                {this.state.minimised ? this.props.marker.displayNameGlobal : this.props.marker.displayNameGlobal + " - " + this.props.quantity}
                            </Typography>
                        </div>

                        <div
                            id={"window-" + id}
                            hidden={this.state.minimised}
                            style={{
                                gridColumn: '1 / -1',
                                gridRow: '2',
                            }}>
                            {
                                this.props.multiple
                                    ? <Chart3D2Q marker={this.props.marker} quantities={this.props.quantity}
                                                 windowID={"window-" + id}/>
                                    : <QuantityChart marker={this.props.marker} quantity={this.props.quantity}
                                                     windowID={"window-" + id}/>
                            }
                        </div>
                    </div>
                </Paper>
            </Draggable>
        );
    }
}
