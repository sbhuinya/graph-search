import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';

declare let vis: any;

@Component({
	selector: 'graph-view',
	templateUrl: './graph-view.component.html',
	styleUrls: ['./graph-view.component.css'],
})
export class GraphViewComponent {
	@Input() nodes: any;
	@Input() edges: any;

	private nodeVisibleList: any = [];

	private typeList: any = [];
	private typeDict: any = {};

	private touchEvent: any;
	private selectedNode: any;
	private selectedNodeID: any;
	private selectedNodeData: any;

	private selectedEdge: any;
	private selectedEdgeID: any;
	private selectedEdgeData: any;

	private showData: any;
	private dataCount = 0;

	private visibleNodeMenu = false;
	private visibleNodeData = false;
	private visibleNodeJSON = false;

	private visibleEdgeMenu = false;
	private visibleEdgeData = false;
	private visibleEdgeJSON = false;

	private isSelected = false;

	private nodeJSON = "";
	private edgeJSON = "";

	private isMore = true;
	private left = '0';
	private top = '0';

	private contextMenuVisible = false;
	private needClose = 0;

	container: any;
	graph: any;

	normalOptions = {
		height: '100%',
		width: '100%',

		"physics": {
			"barnesHut": {
				"avoidOverlap": 1
			},
		},

		nodes: {
			brokenImage: 'assets/images/no_theme.png',
			size: 30,
			physics: false,
			shape: "image",

			fixed: {
				x: false,
				y: false,
			},
		
			font: {
			 	color: '#343434',
				size: 14, // px
				face: 'arial',
				strokeWidth: 1, // px
				align: 'center',
				multi: 'html',
				vadjust: 0,
			},
		},

		layout: {
			randomSeed: 1000,
			improvedLayout: true,
		},

		interaction: {
			hover: true,
			hoverConnectedEdges: true,
		},

		edges: {
			smooth: {
				type: "continuous",
				forceDirection: "horizontal"
			},
			arrows: {
				to: {enabled: true, scaleFactor: 1, type: 'arrow'},
			},
			font: {
				color: 'blue',
				size: 14, // px
				face: 'arial',
				background: 'none',
				strokeWidth: 2, // px
				strokeColor: '#ffffff',
				align: 'horizontal',
				multi: false,
				vadjust: 0,
			},
		},
	};

	constructor(private http: Http) {}

	ngOnChanges(changes) {
		this.getTypes();
		this.drawGraph();
	}

	drawGraph() {
		var graphNodes = [];
		for(var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			console.log("Node" + i, node);
			var idx = this.typeDict[node.type].index;
			if((this.typeList[idx].isSelected == 1 && this.nodeVisibleList[i]) ||
				this.typeList[idx].isSelected == 2) {
				graphNodes.push(node);
			}
		}

		var nodes = new vis.DataSet(graphNodes);
		var edges = new vis.DataSet(this.edges);

		var data = {
			nodes: nodes,
			edges: edges
		};
		
		var options = this.normalOptions;
		this.container = document.getElementById('analysis-graph');
		this.graph = new vis.Network(this.container, data, options);
		
		var self = this;
		this.graph.on('selectNode', (clickObject) => {
			console.log("selectNode");			
			this.onCloseTable();
			this.isSelected = true;

			this.selectedNode = {};

			var nodeID = clickObject.nodes[0];
			for(var i = 0; i < this.nodes.length; i++) {
				var node = this.nodes[i];
				if(node.id == nodeID) {
					this.selectedNode = node;
					break;
				}
			}

			console.log("SHOW NODE MENU");
			this.visibleNodeMenu = true;
		});

		this.graph.on('selectEdge', (clickObject) => {
			this.onCloseTable();
			this.isSelected = true;
			this.selectedEdge = {};

			console.log(clickObject);

			if(clickObject.nodes.length > 0) {
				this.selectedNode = {};

				var nodeID = clickObject.nodes[0];
				for(var i = 0; i < this.nodes.length; i++) {
					var node = this.nodes[i];
					if(node.id == nodeID) {
						this.selectedNode = node;
						break;
					}
				}

				console.log("SHOW NODE MENU");
				self.visibleNodeMenu = true;
			} else {
				var edgeID = clickObject.edges[0];
				for(var i = 0; i < this.edges.length; i++) {
					var edge = this.edges[i];
					if(edge.id == edgeID) {
						this.selectedEdge = edge;
						break;
					}
				}

				console.log("SHOW EDGE MENU");
				this.visibleEdgeMenu = true;
			}
		});
	}

	onViewNode() {
		this.selectedNodeData = [];
		this.visibleNodeData = true;
		this.visibleNodeMenu = false;
		this.visibleNodeJSON = false;
		this.isMore = false;

		var keys = Object.keys(this.selectedNode.data);
		for(var j = 0; j < keys.length; j++) {
			var key = keys[j];
			var obj = {
				key: key,
				value: this.selectedNode.data[key],
			};
			this.selectedNodeData.push(obj);
		}
		console.log("NODE SELECTED");
		this.dataCount = 0;
		this.onNodeShowMore(5);
		this.needClose = 0;
	}

	onViewEdge() {
		this.selectedEdgeData = [];
		this.visibleEdgeData = true;
		this.visibleEdgeMenu = false;
		this.visibleEdgeJSON = false;
		this.isMore = false;

		var keys = Object.keys(this.selectedEdge.data);
		for(var j = 0; j < keys.length; j++) {
			var key = keys[j];
			var obj = {
				key: key,
				value: this.selectedEdge.data[key],
			};
			this.selectedEdgeData.push(obj);
		}
		console.log("Edge SELECTED");
		this.dataCount = 0;
		this.onEdgeShowMore(5);
		this.needClose = 0;
	}

	onRemoveNode() {
		this.visibleNodeData = false;
		this.visibleNodeJSON = false;
		this.visibleNodeMenu = false;

		for(var i = 0; i < this.nodes.length; i++) {
			if(this.nodes[i].id == this.selectedNode.id) {
				this.nodeVisibleList[i] = false;
				break;
			}
		}

		var dict = this.typeDict[this.selectedNode.type];
		var self = this;
		setTimeout(function () {
			self.typeList[dict.index].isSelected = 1;
			self.typeList[dict.index].isAllShowed = false;
			self.refreshGraph(this.selectedNode);
		}, 10);

	}

	onViewNodeJSON() {
		this.onCloseTable();
		this.visibleNodeJSON = true;
		for(var i = 0; i < this.nodes.length; i++) {
			if(this.nodes[i].id == this.selectedNode.id) {
				this.nodeJSON = JSON.stringify(this.nodes[i], null, " ");
				break;
			}
		}

		this.nodeJSON = this.nodeJSON.replace(/\n/g, '<p></p>');
	}

	onViewEdgeJSON() {
		this.onCloseTable();
		this.visibleEdgeJSON = true;
		for(var i = 0; i < this.edges.length; i++) {
			if(this.edges[i].id == this.selectedEdge.id) {
				console.log(this.edges[i]);
				this.edgeJSON = JSON.stringify(this.edges[i], null, " ");
				break;
			}
		}
		this.edgeJSON = this.edgeJSON.replace(/\n/g, '<p></p>');
	}

	getTypes() {
		this.typeDict = {};
		this.nodeVisibleList = [];
		for(var i = 0; i < this.nodes.length; i++) {
			var obj = this.nodes[i];
			var index = obj.type;
			if(this.typeDict[index] == undefined) {
				var type = {
					image: obj.image,
					index: 0,
					type: obj.type,
					isSelected: 2,
					isAllShowed: true,
				};
				this.typeDict[index] = type;
			}
			this.nodeVisibleList.push(true);
		}

		this.typeList = [];
		var keys = Object.keys(this.typeDict);
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var obj = this.typeDict[key];
			this.typeDict[key].index = i;
			this.typeList.push(obj);
		}

	}

	refreshGraph(item) {
		this.drawGraph();
	}

	onTouch(event) {
		console.log("onTouch");
		if(this.isSelected) {
			this.isSelected = false;
			this.left = event.layerX + 'px';
			this.top = (event.layerY + 62) + 'px';
		} else {
			this.onCloseTable();
		}
		console.log("IMPORTANT", this.isSelected);		
	}

	onNodeShowMore(more) {
		console.log("ON SHOW MORE");
		this.needClose = 1;
		this.dataCount += more;
		if(this.dataCount >= this.selectedNodeData.length) {
			this.dataCount = this.selectedNodeData.length;
			this.isMore = false;
		} else {
			this.isMore = true;
		}
		this.refreshNodeData();
	}

	refreshNodeData() {
		this.showData = [];
		for(var i = 0; i < this.dataCount; i++) {
			this.showData.push(this.selectedNodeData[i]);
		}
	}

	onEdgeShowMore(more) {
		console.log("ON SHOW MORE");
		this.needClose = 1;
		this.dataCount += more;
		if(this.dataCount >= this.selectedEdgeData.length) {
			this.dataCount = this.selectedEdgeData.length;
			this.isMore = false;
		} else {
			this.isMore = true;
		}
		this.refreshEdgeData();
	}

	refreshEdgeData() {
		this.showData = [];
		for(var i = 0; i < this.dataCount; i++) {
			this.showData.push(this.selectedEdgeData[i]);
		}
	}

	onCloseTable() {
		this.visibleNodeData = false;
		this.visibleNodeJSON = false;
		this.visibleNodeMenu = false;

		this.visibleEdgeData = false;
		this.visibleEdgeJSON = false;
		this.visibleEdgeMenu = false;
	}

	nodeChecked(item) {
		var self = this;
		setTimeout(function() {
			if(item.isAllShowed) {
				if(item.isSelected == 0) {
					item.isSelected = 2;
				} else {
					item.isSelected = 0;
				}
			} else {
				item.isSelected = (item.isSelected + 1) % 3;
			}
			self.refreshGraph(item);
		}, 10);
	}
}