import { Component, Input , EventEmitter, Output} from '@angular/core';
import { Http } from '@angular/http';
import { MdDialog, MdDialogRef } from '@angular/material';
import { TabularEditDialog } from './tabular-view-dialog/tabular-edit-dialog.component';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

import { environment } from '../../../environments/environment';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

declare let vis: any;

@Component({
	selector: 'tabular-view',
	templateUrl: './tabular-view.component.html',
	styleUrls: ['./tabular-view.component.css'],
})
export class TabularViewComponent {
	@Input() nodes: any;
	@Output() change: EventEmitter<any> = new EventEmitter<any>();
	
	private activeItem = "";
	private activeNode: any = {};	
	private activeData: any = [];


	constructor(private http: Http, public dialog: MdDialog, private toastyService:ToastyService, private toastyConfig: ToastyConfig) {
		this.toastyConfig.theme = 'material';
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

	ngOnChanges(changes) {
		this.activeData = [];
		this.activeNode = {};
		this.activeItem = "";

		if(this.nodes.length > 0) {
			this.activeItem = this.nodes[0].id;
			this.activeNode = this.nodes[0];
		}
		this.refreshData();
	}

	onNodeItem(item) {
		this.activeItem = item.id;
		for(var i = 0; i < this.nodes.length; i++) {
			if(this.nodes[i].id == item.id) {
				this.activeNode = this.nodes[i];
				break;
			}
		}

		this.refreshData();		
	}

	refreshData() {
		if(this.activeNode.data != undefined && this.activeNode.data != null) {
			var keys = Object.keys(this.activeNode.data);
			this.activeData = [];
			for(var i = 0; i < keys.length; i++) {
				var obj = {
					key: keys[i],
					value: this.activeNode.data[keys[i]],
				};
				this.activeData.push(obj);
			}
		}
	}

	onAdd() {
		var add = {
			// isAdd: true,
			key: "",
			value: "",
		};

		let dialogRef = this.dialog.open(TabularEditDialog, {
			data: add,
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result != false && result != undefined) {
				var url = environment.apiURL + "/node/data";
				var body = {
					id: this.activeNode.id,
					key_name: result.key,
					key_value: result.value,
                    action: "add",
                    type: this.activeNode.type
				};

				// Get nodes and edges..
				this.http.put(url, body).subscribe(
					response => {
						this.addToast("Well done! Node data has been successfully added.", 1);
						var data = {
							action: 'add',
							nodeID: this.activeNode.id,
							key: result.key,
							value: result.value

						};

						var obj = {
							key: result.key,
							value: result.value,
						};

						this.activeData.push(obj);
						this.change.emit(data);
					},
					err => {
						this.addToast("Oh snap! Node could not be added. Reason: Message returned by the Backend", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onEdit(item) {
		var update = {
			isAdd: false,
			key: item.key,
			value: item.value,
		};

		var oldKey = item.key + "";

		let dialogRef = this.dialog.open(TabularEditDialog, {
			data: update
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result != false && result != undefined) {
				var url = environment.apiURL + "/node/data";
				var body = {
					id: this.activeNode.id,
					key_name: result.key,
					key_value: result.value,
                    action: "edit",
                    type: this.activeNode.type
				};

				// Get nodes and edges..
				this.http.put(url, body).subscribe(
					response => {
						item.value = result.value;
						item.key = result.key;
						this.addToast("Well done! Property has been successfully edited.", 1);
						var data = {
							action: 'update',
							nodeID: this.activeNode.id,
							oldKey: oldKey,
							newKey: result.key,
							newValue: result.value,
						};

						this.change.emit(data);
						this.addToast("Successfully updated item!", 1);
					},
					err => {
						this.addToast("Oh snap! Property could not be added. Reason: Message returned by the Backend", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}

	onDelete(item, idx) {
		console.log(this.activeNode, idx);

		let dialogRef = this.dialog.open(ConfirmDialog);
		dialogRef.afterClosed().subscribe(result => {
			if(result == true) {
				var body = {
					id: this.activeNode.id,
					key_name: item.key,
					key_value: item.value,
					action: "delete",
                    type: this.activeNode.type
				};
				var url = environment.apiURL + "/node/data";
				console.log(url);

				// Delete item..
				this.http.put(url, body).subscribe(
					response => {
						console.log("[tabular-view] \n Success on delete:", response);
						var data = {
							action: 'delete',
							nodeID: this.activeNode.id,
							key: item.key,
						};

						delete this.activeNode.data[item.key];
						this.activeData.splice(idx, 1);
						this.addToast("Well done! Property has been successfully deleted.", 1);
						this.change.emit(data);
					},
					err => {
						console.log("[tabular-view] \n Error on delete:", err);
						this.addToast("Oh snap! Property could not be deleted. Reason: Message returned by the Backend", 0);
					}
				);

			} else {
				console.log("Cancel");
			}
		});
	}
}

