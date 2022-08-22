import * as React from "react";



type ContainerProps = {
	node: Node;
};

export class NodeContainer extends React.Component<ContainerProps, any> {
	render() {
		return <div ref={(ref) => {
			if (ref) {
				if (this.props.node) {
					ref?.appendChild(this.props.node);
				}
			}
		}}></div>;
	}
}

