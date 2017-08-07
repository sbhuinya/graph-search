import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { MdDialog, MdDialogRef } from '@angular/material';
import { RelationshipAddDialog } from './relationship-add-dialog/relationship-add-dialog.component';
import { RelationshipEditDialog } from './relationship-edit-dialog/relationship-edit-dialog.component';
import { TabularEditDialog } from '../tabular-view/tabular-view-dialog/tabular-edit-dialog.component';
import { DataAddDialog } from './data-add-dialog/data-add-dialog.component';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

import { environment } from '../../../environments/environment';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

declare let vis: any;

@Component({
	selector: 'relationship-view',
	templateUrl: './relationship-view.component.html',
	styleUrls: ['./relationship-view.component.css'],
})
export class RelationshipViewComponent {
	@Input() nodes: any;
	@Input() edges: any;
	@Output() change: EventEmitter<any> = new EventEmitter<any>();

	private dataList: any;
	private nodeDict: any;
	

	constructor(private http: Http, public dialog: MdDialog, private toastyService:ToastyService, private toastyConfig: ToastyConfig) {}

	ngOnChanges(changes) {
		this.nodeDict = {};
		for(var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			this.nodeDict[node.id] = node;
		}

		this.dataList = [];
		for(var i = 0; i < this.edges.length; i++) {
			var edge = this.edges[i];

			var data = [];
			if(edge.data != null) {
				var keys = Object.keys(edge.data);
				for(var j = 0; j < keys.length; j++) {
					var key = keys[j];
					var keyData = {
						key: key,
						value: edge.data[key],
					};
					data.push(keyData);
				}
			}

			var obj = {
				id: edge.id,
				from: this.nodeDict[edge.from].label,
				to: this.nodeDict[edge.to].label,
				label: edge.label,
				internalType: edge.internalType,
				data: data,
				isExpanded: false,
			};

			this.dataList.push(obj);
		}

		console.log("DATA LIST", this.dataList);
	}

	onExpand(item) {
		item.isExpanded = true;
	}

	onCollapse(item) {
		item.isExpanded = false;
	}

	onAddRelation() {
		var add = {
			from: '',
			to: '',
			label: '',
		};

		let dialogRef = this.dialog.open(RelationshipAddDialog, {
			data: add
		});
		dialogRef.afterClosed().subscribe(result => {
			console.log("DATA", result);

			if(result == undefined) {
				return;
			}

			var fromNode = this.getNode(result.from);
			var toNode = this.getNode(result.to);
			if(fromNode == null || toNode == null) {
				this.addToast("Oh snap! Node(s) does not exist!", 0);
				return;
			}

			if(result != false && result != undefined) {
				var url = environment.apiURL + "/relationship";
				var body = {
					source_ref: fromNode.id,
					target_ref: toNode.id,
					relationship_type: result.label,
				};

				// Get nodes and edges..
				this.http.post(url, body).subscribe(
					response => {
						console.log("[relationship-view] \n Success on add:", response);
						var time = new Date().getTime();

						var obj = {
							id: "relation-" + time,
							from: result.from,
							to: result.to,
							label: result.label,
							internalType: result.label,
							data: [],
							isExpanded: false,
						};
						this.dataList.push(obj);

						var data = {
							relationID: "relation-" + time,
							action: 'add-relation',
							from: fromNode.id,
							to: toNode.id,
							label: result.label,
						};
						this.change.emit(data);
						this.addToast("Successfully added relationship!", 1);
					},
					err => {
						console.log("[relationship-view] \n Error on add:", err);
						this.addToast("Failed on adding relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onEditRelation(item) {
		var update = {
			id: item.id,
			from: item.from,
			to: item.to,
			internalType: item.internalType,
			isExpanded: item.isExpanded,
			label: item.label,
		};

		let dialogRef = this.dialog.open(RelationshipEditDialog, {
			data: update
		});
		dialogRef.afterClosed().subscribe(result => {
			console.log("DATA", result);

			if(result != false && result != undefined) {
				var url = environment.apiURL + "/relationship";
				var body = {
					id: result.id,
					source_ref: result.from,
					target_ref: result.to,
					relationship_type: result.label,
				};

				// Get nodes and edges..
				this.http.put(url, body).subscribe(
					response => {
						console.log("[relationship-view] \n Success on update:", response);
						item.label = result.label;
						var data = {
							action: 'update-relation',
							relationID: item.id,
							label: result.label,							
						};
						this.change.emit(data);
						this.addToast("Successfully updated relationship!", 1);
					},
					err => {
						console.log("[relationship-view] \n Error on update:", err);
						this.addToast("Failed on updating relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onDeleteRelation(item, idx) {
		let dialogRef = this.dialog.open(ConfirmDialog);
		dialogRef.afterClosed().subscribe(result => {
			if(result == true) {
				var url = environment.apiURL + "/relationship/" + item.id;
				console.log("URL", url);

				// Get nodes and edges..
				this.http.delete(url).subscribe(
					response => {
						console.log("[tabular-view] \n Success on delete:", response);
						var obj = {
							action: 'delete-relation',
							relationID: item.id,
						};
						this.dataList.splice(idx, 1);
						this.addToast("Successfully deleted relationship!", 1);
						this.change.emit(obj);
					},
					err => {
						console.log("[tabular-view] \n Error on delete:", err);
						this.addToast("Failed on deleting relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onEditItem(row, item) {
		var update = {
			key: item.key,
			value: item.value,
		};

		var oldKey = item.key + "";

		let dialogRef = this.dialog.open(TabularEditDialog, {
			data: update
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result != false && result != undefined) {
				var url = environment.apiURL + "/relationship/data";
				var body = {
					id: row.id,
					key_name: item.key,
					key_value: item.value,
					type: "relationship",
					action: "edit"
				};

				// Get nodes and edges..
				this.http.put(url, body).subscribe(
					response => {
						console.log("[tabular-view] \n Success on update:", response);
						item.value = result.value;
						item.key = result.key;
						var data = {
							action: 'update-item',
							relationID: row.id,
							oldKey: oldKey,
							itemKey: item.key,
							itemValue: item.value,
						};

						this.change.emit(data);
						this.addToast("Successfully updated item of relationship!", 1);
					},
					err => {
						console.log("[tabular-view] \n Error on update:", err);
						this.addToast("Failed on updating item of relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onDeleteItem(row, item) {
		let dialogRef = this.dialog.open(ConfirmDialog);
		dialogRef.afterClosed().subscribe(result => {
			if(result == true) {
				console.log("DATA", result);

				var obj = {
					id: row.id,
					key_name: item.key,
					key_value: item.value,
					type: "relationship",
					action: "delete"
				};

				var url = environment.apiURL + "/relationship/data";

				// Get nodes and edges..
				this.http.put(url, obj).subscribe(
					response => {
						console.log("[tabular-view] \n Success on delete:", response);
						var data = {
							action: 'delete-item',
							relationID: row.id,
							key: item.key,
							value: item.value,
						};

						this.change.emit(data);
						this.addToast("Successfully deleted item of relationship!", 1);
					},
					err => {
						console.log("[tabular-view] \n Error on delete:", err);
						this.addToast("Failed on deleting item of relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onAddData(row) {
		var add = {
			id: new Date().getTime(),
			key: "",
			value: "",
		};

		let dialogRef = this.dialog.open(DataAddDialog, {
			data: add,
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result != false && result != undefined) {
				var url = environment.apiURL + "/relationship/data";
				var body = {
					id: row.id,
					key_name: result.key,
					key_value: result.value,
					action: "add",
					type: "relationship"
				};

				// Get nodes and edges..
				this.http.put(url, body).subscribe(
					response => {
						console.log("[tabular-view] \n Success on add:", response);
						row.data.push(result);
						var data = {
							action: 'add-item',
							relationID: row.id,
							key: result.key,
							value: result.value,
						};
						this.change.emit(data);
						this.addToast("Successfully added item of relationship!", 1);
					},
					err => {
						console.log("[tabular-view] \n Error on add:", err);
						this.addToast("Failed on adding item of relationship!", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});		
	}

	getNode(label) {
		for(var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			if(node.label == label) {
				return node;
			}
		}

		return null;
	}

	addToast(msgStr, type) {
        // Just add default Toast with title only
        // Or create the instance of ToastOptions
        var toastOptions:ToastOptions = {
            title: "",
            msg: msgStr,
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap',
            onAdd: (toast:ToastData) => {
                console.log('Toast ' + toast.id + ' has been added!');
            },
            onRemove: function(toast:ToastData) {
                console.log('Toast ' + toast.id + ' has been removed!');
            }
        };
        // Add see all possible types in one shot
		if(type == 0) {
        	this.toastyService.warning(toastOptions);
		}
		else {
			this.toastyService.success(toastOptions);
		}
    }

}

