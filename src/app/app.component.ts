import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent {
    visibleJSON = false;
    selectedTabIndex: number;
    /* ----------------- Functions ----------------- */
    constructor() {
        this.selectedTabIndex = 1;
    }

    ngOnInit() {
    }

    tabClicked(tabIndex) {
        console.log("Tab Clicked", tabIndex);
        this.selectedTabIndex = tabIndex;
    }

    viewJsonClicked() {
        this.visibleJSON = !this.visibleJSON;
    }

    saveClicked() {

    }

    closeJSONDlg() {
        this.visibleJSON = false;
    }
}
