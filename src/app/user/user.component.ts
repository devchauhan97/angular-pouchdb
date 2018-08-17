import { Component, OnInit,NgZone } from '@angular/core';
import { UserService } from '../service/user.service';
import { IAddForm ,IEditForm,IFriend} from '../service/user.model';
import { ISyncResult } from "../service/pouchdb.model";
import { PouchDBService } from "../service/pouchdb.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  	public people: Array<any>;
    public form: any;

    public constructor(private pouchdbservice: PouchDBService, private zone: NgZone) {
        this.people = [];
        this.form = {
            "username": "",
            "firstname": "",
            "lastname": ""
        }
    }

    public ngOnInit() {
        this.pouchdbservice.sync("http://192.168.1.49:9000/nraboy");
        this.pouchdbservice.getChangeListener().subscribe(data => {
            for(let i = 0; i < data.change.docs.length; i++) {
                this.zone.run(() => {
                    this.people.push(data.change.docs[i]);
                });
            }
        });
        this.pouchdbservice.fetch().then(result => {
            this.people = [];
            for(let i = 0; i < result.rows.length; i++) {
                this.people.push(result.rows[i].doc);
            }
        }, error => {
            console.error(error);
        });
    }

    public insert() {
        if(this.form.username && this.form.firstname && this.form.lastname) {
            this.pouchdbservice.put(this.form.username, this.form);
            this.form = {
                "username": "",
                "firstname": "",
                "lastname": ""
            }
        }
    }

    public delete(id) {

        if(id) {
            this.pouchdbservice.delete(id);
            
        }
    }
}
