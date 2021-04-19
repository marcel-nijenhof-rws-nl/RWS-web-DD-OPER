const React = require('react');

const InputLabel = require('@material-ui/core/InputLabel').default;
const MenuItem = require('@material-ui/core/MenuItem').default;
const Select = require('@material-ui/core/Select').default;
const FormControl = require('@material-ui/core/FormControl').default;
const chart = require('../charts.jsx');

class CustomSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ""};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(item) {
        this.setState({value: item.target.value});

        switch (this.props.label) {
            case "Locatie":
                chart.showOptions(item.target.value);
                break;
            case "Kwantiteit":
                if (item.target.value === "waterlevel") {
                    chart.showInterval(false);
                } else {
                    chart.showInterval(true)
                }
                break;
            default:
                console.log(this.props.label);
                break;
        }
    }

    render() {
        return <>
            <FormControl>
                <InputLabel style={{color: "white", paddingLeft: 5}}
                            id={this.props.label}>{this.props.label}</InputLabel>
                <Select style={{
                    minWidth: 250,
                    color: "white",
                    backgroundColor: "rgba(1,1,1,0.2)",
                    paddingLeft: 5,
                    borderRadius: 5
                }}
                        labelId={this.props.label}
                        id={this.props.label + "-select"}
                        defaultValue=""
                        onChange={this.handleChange}
                        disableUnderline={true}
                >
                    {this.props.items.map(item => (
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>

    }
}

module.exports = CustomSelect;
