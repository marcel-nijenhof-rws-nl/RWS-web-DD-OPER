import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import LiquidChart from "react-liquidchart";

export default class WaterLevelLegend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const stops = [
            <stop key={1} stopColor={'rgba(0,136,255,0.8)'} offset="0%"/>
        ];

        return <>
            <Paper elevation={0}
                   className={"paper paper-container"}
                   style={{paddingBottom: '10px'}}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingBottom: '10px'
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"h5"}>{"Waterhoogte afgelopen 24 uur (NAP)"}</Typography>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"h6"}>{this.props.location}</Typography>
                        </div>
                    </div>
                </div>
                <div style={{
                    height: '150px',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    marginBottom: '10px'
                }}>

                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"subtitle1"}>{"Gemiddeld"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.averageLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"subtitle1"}>{"Mediaan"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.median}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"subtitle1"}>{"Laagst"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.minLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"subtitle1"}>{"Hoogst"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.maxLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                </div>
            </Paper>
        </>
    }
}
