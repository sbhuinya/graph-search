import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { NgModel } from '@angular/forms';

declare let vis: any;

export class JsonData {
	selected: boolean;
	key: number;
	value: string;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})

export class CreateComponent implements OnInit {

  @Input() visibleJSON: boolean;
  @Output() closeJSONDlg = new EventEmitter();
 //-----Variables for adding Node info
  selectedNode;
  relationshipStr = "";

  visibleAddNodeDialog = false;
  visibleRefDialog = false;
  visibleRelationDialog = false;
  addedCnt = 0;
  nodeJsonArr = [];

  nodeJSON = "";

  //-----Variables for adding ref info
  refDataArr = [];
  pageRefsArr = [];
  curPageIndex = 0;
  visiblePageIndexArr = [];
  firstVisiblePageIndex = 0;

  relationFirstNodeSelected = false;
  
  relationFirstNode;
  relationSecondNode;
  
  typeImgArr = ["cve", "course-of-action", "observed-data", "malware", "intrusion-set", "infrastructure", "campaign", "bundle", "identity", "threat-actor", "attack-pattern", "indicator", "no-theme", "ref"];

  left = '';
  top = '';

  title = "ABCDEF";
  edges = [];
  graphNodes = [];

  private typeList: any = [];
	private typeDict: any = {};

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
			color: {
				border: "rgb(200, 0 ,0 )",
				background: "rgb(0, 200, 0",
				hover: "rgb(0, 0, 200)"
			},
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

  leftItems = [
    {type:0, image:'cve'},
    {type:1, image:'course-of-action'},
    {type:2, image:'observed-data'},
    {type:3, image:'malware'},
    {type:4, image:'intrusion-set'},
    {type:5, image:'infrastructure'},
    {type:6, image:'campaign'},
    {type:7, image:'bundle'},
    {type:8, image:'identity'},
    {type:9, image:'threat-actor'},
    {type:10, image:'attack-pattern'},
    {type:11, image:'indicator'},
    {type:12, image:'no_theme'},
    {type:13, image:'ref'},
  ];

  constructor() { }

  ngOnInit() {
	this.refDataArr = [
		{index:0, field1:'John1', field2:'Mark', field3: 'Sunday', checked: false},
		{index:1, field1:'larry1', field2:'john', field3:'Monday', checked: false},
		{index:2, field1:'Jacob1', field2:'Throton', field3:'Tuesday', checked: false},
		{index:3, field1:'Harry1', field2:'Potter', field3:'Wednesday', checked: false},
		{index:4, field1:'Jancy1', field2:'Jackie', field3:'Thursday', checked: false},
		{index:5, field1:'John2', field2:'Mark', field3: 'Sunday', checked: false},
		{index:6, field1:'larry2', field2:'john', field3:'Monday', checked: false},
		{index:7, field1:'Jacob2', field2:'Throton', field3:'Tuesday', checked: false},
		{index:8, field1:'Harry2', field2:'Potter', field3:'Wednesday', checked: false},
		{index:9, field1:'Jancy2', field2:'Jackie', field3:'Thursday', checked: false},
		{index:10, field1:'John3', field2:'Mark', field3: 'Sunday', checked: false},
		{index:11, field1:'larry3', field2:'john', field3:'Monday', checked: false},
		{index:12, field1:'Jacob3', field2:'Throton', field3:'Tuesday', checked: false},
		{index:13, field1:'Harry3', field2:'Potter', field3:'Wednesday', checked: false},
		{index:14, field1:'Jancy3', field2:'Jackie', field3:'Thursday', checked: false},
		{index:15, field1:'John4', field2:'Mark', field3: 'Sunday', checked: false},
		{index:16, field1:'larry4', field2:'john', field3:'Monday', checked: false},
		{index:17, field1:'Jacob4', field2:'Throton', field3:'Tuesday', checked: false},
		{index:18, field1:'Harry4', field2:'Potter', field3:'Wednesday', checked: false},
		{index:19, field1:'Jacob4', field2:'Throton', field3:'Tuesday', checked: false},
		{index:20, field1:'John5', field2:'Mark', field3: 'Sunday', checked: false},
		{index:21, field1:'larry5', field2:'john', field3:'Monday', checked: false},
		{index:22, field1:'Jacob5', field2:'Throton', field3:'Tuesday', checked: false},
		{index:23, field1:'Harry5', field2:'Potter', field3:'Wednesday', checked: false},
		{index:24, field1:'Jacob5', field2:'Throton', field3:'Tuesday', checked: false},
		{index:25, field1:'John6', field2:'Mark', field3: 'Sunday', checked: false},
		{index:26, field1:'larry6', field2:'john', field3:'Monday', checked: false},
		{index:27, field1:'Jacob6', field2:'Throton', field3:'Tuesday', checked: false},
	];
  }

  leftItemClicked(type) {
	this.addedCnt ++;
    var newNode = {id: new Date().getTime(), image: "assets/images/" + this.leftItems[type].image + ".jpg", type: type, x:undefined, y:undefined};
    this.graphNodes.push(newNode);
    this.drawGraph();
  }

  drawGraph() {	
	//-------get original node post and set
	var nodeIdArr = [];
	for(var i = 0; i < this.graphNodes.length; i++) {
		var graphNode = this.graphNodes[i];
		nodeIdArr.push(graphNode.id);
	}
	if(this.graph != undefined) {
		var positionArr = this.graph.getPositions(nodeIdArr);
		for(var i = 0; i < this.graphNodes.length; i++)
			{
				var graphNode = this.graphNodes[i];
				if(positionArr[graphNode.id] != undefined) {
					graphNode.x = positionArr[graphNode.id].x;	
					graphNode.y = positionArr[graphNode.id].y;	
				}
			}
	}

	console.log("Graph Nodes", this.graphNodes);
	var nodes = new vis.DataSet(this.graphNodes);
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
		var selectedNodeId = clickObject.nodes[0];
		for(var i = 0; i < this.graphNodes.length; i++) {
			this.selectedNode = this.graphNodes[i];
			if(this.selectedNode.id == selectedNodeId) {
				break;
			}
		}

		console.log("*****Node Selected*****", this.selectedNode);
		var event = clickObject.event.srcEvent;
		if(event.x + 500 > window.innerWidth) {
			if(this.selectedNode.type == 13) {
				this.left = (window.innerWidth - 760) + 'px';				
			}
			else {
				this.left = (window.innerWidth - 700) + 'px';								
			}
			this.top = event.y + 'px';
		}
		else {
			this.left = (event.x - 200) + 'px';
			this.top = event.y + 'px';
		}

		var isCtrlKey = clickObject.event.srcEvent.ctrlKey;
		if(isCtrlKey) {
			var nodeIdsArr = [];
			nodeIdsArr[0] = this.selectedNode.id;
			if(this.relationFirstNodeSelected) {
				if(this.selectedNode.id != this.relationFirstNode.id) {
					this.selectedNode.image = "assets/images/" + this.typeImgArr[this.selectedNode.type] + "-selected.jpg";
					this.drawGraph();

					this.relationSecondNode = this.selectedNode;
					this.relationFirstNodeSelected = false;
					this.visibleRelationDialog = true;	

					var selectedEdge;
					for(var i = 0; i < this.edges.length; i++) {
						if(this.edges[i].from == this.relationFirstNode.id && this.edges[i].to == this.relationSecondNode.id) {
							selectedEdge = this.edges[i];
							break;
						}
					}
					console.log("AAAAAA", selectedEdge);
					if(selectedEdge == undefined) {
						var initialJsonData = {selected:false, key:"", value:""};
						this.nodeJsonArr = [];
						this.nodeJsonArr.push(initialJsonData);
						this.relationshipStr = "";						
					}
					else {
						if(selectedEdge.data == undefined) {
							var initialJsonData = {selected:false, key:"", value:""};
							this.nodeJsonArr = [];
							this.nodeJsonArr.push(initialJsonData);	
						}
						else{
							this.nodeJsonArr = selectedEdge.data;
						}
						this.relationshipStr = selectedEdge.relationship;	
					}
				}
			}
			else {
				this.selectedNode.image = "assets/images/" + this.typeImgArr[this.selectedNode.type] + "-selected.jpg";
				this.relationFirstNodeSelected = true;
				this.relationFirstNode = this.selectedNode;
				this.drawGraph();
			}
		}
		else {
			if(!this.relationFirstNodeSelected) {
				if(this.selectedNode.type == 13) {
					console.log("ASDASDASD");
					for(var i = 0; i < this.refDataArr.length / 5; i++) {
						this.pageRefsArr[i] = [];
					}

					this.visibleRefDialog = true;
					var j = 0;
					for(var i = 0; i < this.refDataArr.length; i++) {
						console.log("Ref Val", this.refDataArr[i]);
						this.pageRefsArr[j][i%5] = this.refDataArr[i];
						if(i % 5 == 4) {
							if(j < 4) { //4 is max visible page count
								this.visiblePageIndexArr[j] = j;
							}
							j++;
						}
					}
					console.log("PAGE REFS ARRAY", this.pageRefsArr);
				}
				else {
					this.visibleAddNodeDialog = true;
					if(this.selectedNode.data == undefined) {
						var initialJsonData = {selected:false, key:"", value:""};
						this.nodeJsonArr = [];
						this.nodeJsonArr.push(initialJsonData);	
					}
					else {
						this.nodeJsonArr = this.selectedNode.data;
					}
				}		
			}
		}
	});

	this.graph.on('deselectNode', (clickObject) => {
		console.log("*****Node Deselected*****");		
		this.visibleAddNodeDialog = false;
		this.visibleRefDialog = false;
	});
  }

  onTouch(event) {
	  if(this.relationFirstNodeSelected) {
		  this.relationFirstNode.image = "assets/images/" + this.typeImgArr[this.relationFirstNode.type] + ".jpg";
		  this.drawGraph();
		  this.relationFirstNodeSelected = false;
	  }
	  if(this.visibleRelationDialog) {
		  this.closeRelationDialog();	
		  this.closeDialog();	  
	  }
	  this.closeJSONDlg.emit();	  
  }

  remove() {
	for(var i = 0; i < this.nodeJsonArr.length; i++) {
		var nodeJsonData = this.nodeJsonArr[i];
		if(nodeJsonData.selected) {
			this.nodeJsonArr.splice(i, 1);
			i--;
		}
	}
  }

  addNew() {
	var addedData = {selected:false, key:"", value:""};
	this.nodeJsonArr.push(addedData);
  }

  closeDialog() {
	this.visibleAddNodeDialog = false;
	this.visibleRefDialog = false;
  }

  closeRelationDialog() {
	this.visibleRelationDialog = false;
	this.relationFirstNode.image = "assets/images/" + this.typeImgArr[this.relationFirstNode.type] + ".jpg";
	this.relationSecondNode.image = "assets/images/" + this.typeImgArr[this.relationSecondNode.type] + ".jpg";
	this.drawGraph();
  }

  saveNode() {
	  console.log("Save clicked");
	  this.selectedNode.data = this.nodeJsonArr;
	  this.closeDialog();	  
	  this.drawGraph();
  }

  deleteNode() {
		console.log("Save clicked");
		/*this.selectedNode.label = this.labelStr;
		this.selectedNode.description = this.descriptionStr;*/
		for(var i = 0; i < this.graphNodes.length; i++) {
			if(this.graphNodes[i].id == this.selectedNode.id) {
				this.graphNodes.splice(i, 1);
				break;
			}
		}
		this.closeDialog();		
		this.drawGraph();
	}

	saveRelationship() {
		var newRelation = {from: this.relationFirstNode.id, to: this.relationSecondNode.id, data:this.nodeJsonArr, relationship: this.relationshipStr};
		this.edges.push(newRelation);
		this.closeRelationDialog();
		this.drawGraph();		
	}

	refItemSelected(index) {
		for(var i = 0; i < this.refDataArr.length; i++) {
			this.refDataArr[i].checked = false;
		}
		this.refDataArr[index].checked = true;
		console.log("First Page Info", this.pageRefsArr[0]);
	}

	refPageClicked(index) {
		this.curPageIndex = this.firstVisiblePageIndex + index;
	}

	toLeftPage() {
		if(this.firstVisiblePageIndex > 0) {
			this.firstVisiblePageIndex --;
			this.curPageIndex --;
		}
	}

	toRightPage() {
		if((this.firstVisiblePageIndex + 3) < this.pageRefsArr.length - 1) {
			this.firstVisiblePageIndex ++;		
			this.curPageIndex ++;	
		}
	}

	closeRefDialog() {
		this.visibleRefDialog = false;
	}

	chooseClicked() {
		this.visibleRefDialog = false;
	}


	closeJsonDialog() {
		this.visibleJSON = false;
		this.closeJSONDlg.emit();
	}
	
	showJsonDialog() {		
		if(this.graphNodes[0] != undefined) {
			this.nodeJSON = JSON.stringify(this.graphNodes[0], null, " ");
			this.nodeJSON = this.nodeJSON.replace(/\n/g, '<p></p>');
		}
	}

	ngOnChanges() {
		console.log("APP JSON BUTTON CLICKED");
		this.showJsonDialog();
	}
}
