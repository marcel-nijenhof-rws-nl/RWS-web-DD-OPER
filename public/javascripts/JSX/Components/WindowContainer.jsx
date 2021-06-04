import React from "react";
import Window from "./Window.jsx";

export default class WindowContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div id={"window-container"}>
                {this.props.children.map(child => (
                    <Window
                        key={
                            child.quantity[0] !== undefined && child.quantity[1] !== undefined
                                ? child.marker.displayName + "-" + child.quantity[0] + "-" + child.quantity[1]
                                : child.marker.displayName + "-" + child.quantity[0]
                        }
                        quantity={
                            child.quantity[0] !== undefined && child.quantity[1] !== undefined
                                ? child.quantity
                                : child.quantity[0]
                        }
                        marker={child.marker}
                        container={this.props.children}
                        multiple={
                            (child.quantity[0] !== undefined && child.quantity[1] !== undefined)
                            || child.quantity.includes("waveenergy")
                            || child.quantity.includes("wavedirection")
                        }
                    />
                ))}
            </div>
        )
    }

}
