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

    public constructor(private database: PouchDBService, private zone: NgZone) {
        this.people = [];
        this.form = {
            "username": "",
            "firstname": "",
            "lastname": ""
        }
    }

    public ngOnInit() {

        this.database.sync("http://192.168.1.49:9000/nraboy");

        this.database.getChangeListener().subscribe(data => {
            
            for(let i = 0; i < data.change.docs.length; i++) {

                console.log('live subscribe',data)
                if(data.change.docs[i]._deleted)
                {
                    console.log('live deleted',data.change.docs[i]._id)
                    this.people.splice(data.change.docs[i]._id);
                    
                }else
                {
                    this.zone.run(() => {
                        this.people[data.change.docs[i]._id]=data.change.docs[i];
                    });
                }
            }
        });

        this.database.getLocalChangeListener().subscribe(data => {
            
            console.log('local subscribe',data)
            if(data.doc._deleted)
            {
                console.log('local deleted',data.doc._id)
                this.people.splice(data.doc._id,1); 
                
            }else
            {
                this.zone.run(() => {
                    this.people[data.doc._id]=data.doc;
                });
            }
            //this.getall()
        });
        this.getall()
    }
    public getall(){

         this.database.fetch().then(result => {
            this.people = [[]];
            for(let i = 0; i < result.rows.length; i++) {

                this.people[result.rows[i].doc._id]=result.rows[i].doc;

            }
             console.log('people',this.people)
        }, error => {
            console.error(error);
        });
    }
    public insert() {
        if(this.form.username && this.form.firstname && this.form.lastname) {
            this.database.put(this.form.username, this.form);
            this.form = {
                "username": "",
                "firstname": "",
                "lastname": ""
            }
        }
    }

    public delete(id) {

        if(id) {
           let res= this.database.delete(id);
           // console.log(res)
           // this.getResult();
        }
    }
}
