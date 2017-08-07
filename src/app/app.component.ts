import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import { Http } from '@angular/http';

import { environment } from '../environments/environment';

import {Tabs} from './components/tabs/tabs.component';
import {Tab} from './components/tab/tab.component';

import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {

    /* ----------------- Variables ----------------- */
    title = 'Intel Search';

    nodes: any = [];
    edges: any = [];
    isLoaded = false;

    searchItems = [
        // {
        //     value: "few",
        //     isLoaded: false,
        // }, {
        //     value: "lot",
        //     isLoaded: false,
        // }, {
        //     value: "alot",
        //     isLoaded: false,
        // }
    ];

    activeItem = "";

    searchedData: any = {};


    /* ----------------- Functions ----------------- */
    constructor(public http: Http, private toastyService:ToastyService, private toastyConfig: ToastyConfig) {
        this.toastyConfig.theme = 'material';
    }

    ngOnInit() {
        this.refreshData();
    }

    refreshData() {
        this.searchedData = {};
    }

	retrieveData(text) {
        if(text == "" || text == undefined) {
            return;
        }

        var data = this.searchedData[text];
        console.log("DATA", data)
        if(data == null || data == undefined) {
            var url = environment.apiURL + "/context?query=" + text;

            // Get nodes and edges..
            this.http.get(url).subscribe(
                response => {
                    var result = response.json();
                    console.log("[AppComponent] \n Nodes and Edges Result:", result);
                    this.parseData(result);
                    this.searchItems.push({
                        value: text,
                        isLoaded: true,
                    });
                    this.searchedData[text] = {
                        node: this.nodes,
                        edge: this.edges
                    };
                    this.isLoaded = true;
                },
                err => {
                    console.log("[AppComponent] \n Error on get data:", err);
                }
            );
        } else {
            this.edges = data.edge;
            this.nodes = data.node;
            this.isLoaded = true;
        }
    }

    parseData(data) {
        this.edges = [];
        this.nodes = [];
        var ids = {};
        
        if(data['edges'] == undefined) {
            console.log("[AppComponent] \n Parse Data Error : No edges!");
        }

        for(var i = 0; i < data.edges.length; i++) {
            var obj = data.edges[i];
            var isExist = ids[obj.id];
            if(!isExist) {
                var edge = {
                    id: obj.id,
                    label: obj.internalType,
                    internalType: obj.internalType,
                    from: obj.source,
                    to: obj.target,
                    data: obj.data,
                };
                this.edges.push(edge);
            }
            ids[obj.id] = true;
        }

        if(data['nodes'] == undefined) {
            console.log("[AppComponent] \n Parse Data Error : No nodes!");
        }

        ids = {};
        
        for(var i = 0; i < data.nodes.length; i++) {
            var obj = data.nodes[i];
            var isExist = ids[obj.id];
            if(!isExist) {
                var node = {
                    id: obj.id,
                    label: obj.label,
                    type: obj.type,
                    image: 'assets/images/' + obj.type + ".jpg",
                    data: obj.data,
                };
            }
            ids[obj.id] = true;
            this.nodes.push(node);
        }
    }

    search(result) {
        // var first = result.text.substring(0, 1);
        // var last = result.text.substring(result.text.length - 1, result.text.length);
        // console.log(first, last);
        // if(!((first == '"' && last== '"') || (first == "'" && last == "'"))) {
        //     this.addToast();
        //     return;
        // }

        var filteredText = result.text.replace(/"/g, '');
        filteredText = filteredText.replace(/'/g, '');
        console.log("FILTERED TEXT", filteredText);
        if(filteredText.length < 4) {
            this.addToast();
        }
        else {
            this.activeItem = filteredText;
            this.retrieveData(filteredText);
        }
    }

    addToast() {
        // Just add default Toast with title only
        // Or create the instance of ToastOptions
        var toastOptions:ToastOptions = {
            title: "",
            msg: "Oh snap! The Search Team should be at least 4 characters long, excluding trailing and leading quotes, double quotes or whitespaces. We know you didn't do it intentionally.",
            showClose: true,
            timeout: 5000,
            theme: 'default',
            onAdd: (toast:ToastData) => {
                console.log('Toast ' + toast.id + ' has been added!');
            },
            onRemove: function(toast:ToastData) {
                console.log('Toast ' + toast.id + ' has been removed!');
            }
        };
        // Add see all possible types in one shot
        this.toastyService.warning(toastOptions);
    }

    onSearchItem(item) {
        console.log("SEARCH", item);
        this.activeItem = item.value;
        item.isLoaded = true;
        this.retrieveData(item.value);
    }

    onClosePane(event, item) {
        event.stopPropagation();
        console.log("CLOSE PANE");
        
        item.isLoaded = false;

        var flag = item.value == this.activeItem;

        if(flag) {
            this.activeItem = "";
            this.nodes = [];
            this.edges = [];
        }
        
        var keys = Object.keys(this.searchedData);
        for(var i = 0; i < keys.length; i++) {
            if(flag && keys[i] != item.value) {
                console.log(keys[i], this.searchedData);
                if(this.searchedData[keys[i]] != null) {
                    flag = false;
                    this.activeItem = keys[i];
                    this.nodes = this.searchedData[keys[i]].node;
                    this.edges = this.searchedData[keys[i]].edge;
                }
            }

            if(item.value == keys[i]) {
                delete this.searchedData[keys[i]];
            }
        }

        for(var i = 0; i < this.searchItems.length; i++) {
            if(this.searchItems[i].value == item.value) {
                this.searchItems.splice(i, 1);
                break;
            }
        }

    }

    onChangeTabular(data) {
        this.edges = [];
        this.nodes = [];

        console.log("Tabular Change", data);

        var sData = this.searchedData[this.activeItem];
        for(var i = 0; i < sData.node.length; i++) {
            var node = sData.node[i];
            if(node.id == data.nodeID) {
                console.log("MATCHED", this.searchedData[this.activeItem].node[i]);
                if(data.action == 'update') {
                    var oldKey = data.oldKey;
                    var newKey = data.newKey;
                    var newValue = data.newValue;

                    delete this.searchedData[this.activeItem].node[i].data[oldKey];
                    this.searchedData[this.activeItem].node[i].data[newKey] = newValue;
                } else if(data.action == 'add') {
                    var newKey = data.key;
                    var newValue = data.value;
                    this.searchedData[this.activeItem].node[i].data[newKey] = newValue;
                } else if(data.action == 'delete') {
                    var key = data.key;
                    delete this.searchedData[this.activeItem].node[i].data[key];
                }
                break;
            }
        }

        setTimeout( () => {
            this.edges = this.searchedData[this.activeItem].edge;
            this.nodes = this.searchedData[this.activeItem].node;
            console.log(this.edges, this.nodes);
        }, 10);
    }

    onChangeRelationship(data) {
        this.edges = [];
        this.nodes = [];

        var sData = this.searchedData[this.activeItem];

        console.log("Relationship Change", data, sData);

        for(var i = 0; i < sData.edge.length; i++) {
            var edge = sData.edge[i];
            if(edge.id == data.relationID) {
                console.log("MATCHED", this.searchedData[this.activeItem].edge[i]);
                if(data.action == 'add-relation') {
                    var obj = {
                        id: data.id,
                        label: data.label,
                        internalType: data.label,
                        from: data.from,
                        to: data.to,
                        data: {},
                    }
                    this.searchedData[this.activeItem].edge.push(obj);
                } else if(data.action == 'update-relation') {
                    var relation = data.label;

                    this.searchedData[this.activeItem].edge[i].label = relation;
                    this.searchedData[this.activeItem].edge[i].internalType = relation;
                } else if(data.action == 'delete-relation') {
                    this.searchedData[this.activeItem].edge.splice(i, 1);
                } else if(data.action == 'add-item') {
                    this.searchedData[this.activeItem].edge[i].data[data.key] = data.value;
                } else if(data.action == 'update-item') {
                    delete this.searchedData[this.activeItem].edge[i].data[data.oldKey];
                    this.searchedData[this.activeItem].edge[i].data[data.itemKey] = data.itemValue;
                } else if(data.action == 'delete-item') {
                    delete this.searchedData[this.activeItem].edge[i].data[data.key];
                }
                break;
            }
        }

        setTimeout( () => {
            this.edges = this.searchedData[this.activeItem].edge;
            this.nodes = this.searchedData[this.activeItem].node;
            console.log(this.edges, this.nodes);
        }, 10);
    }

}
