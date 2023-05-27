import * as React from "react";

type ContainerProps = {
	node: Node;
};

export class NodeContainer extends React.Component<ContainerProps, any> {
	containerRef: React.RefObject<HTMLDivElement>;

	constructor(props: ContainerProps) {
		super(props);
		this.containerRef = React.createRef();
	}

	componentDidMount() {
		this.updateNode();
	}

	componentDidUpdate(prevProps: ContainerProps) {
		if (prevProps.node !== this.props.node) {
            this.updateNode();
        }
	}

	updateNode() {
		const divElement = this.containerRef.current;
		if (divElement && this.props.node) {
			// 清除div中已有的内容（如果有的话）
			while (divElement.firstChild) {
				divElement.firstChild.remove();
			}
			// 添加新的子节点
			divElement.appendChild(this.props.node);
		}
	}

	render() {
		return <div ref={this.containerRef}></div>;
	}
}