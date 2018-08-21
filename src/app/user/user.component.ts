import { Component, OnInit,NgZone,Output,EventEmitter } from '@angular/core';
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
    public page: any;
     
    @Output() pageChange: EventEmitter<number> = new EventEmitter();
    total_rows: number ;

    public constructor(private database: PouchDBService, private zone: NgZone) {
        this.people = [];
        this.page = 0;
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
                    
                    //this.deleteHtml(data.change.docs[i]._id)  
                    this.getall(this.page)
                }
                else
                {
                    console.log('live create',data.doc._id)
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
                //this.deleteHtml(data.doc._id) 
                this.getall(this.page)
            }
            else
            {
                console.log('local create',data.doc._id)
                this.zone.run(() => {
                    this.people.push(data.doc);
                });
            }
            //this.getall()
        });
        this.getall(this.page);
    }
    public getall(offset:string){

         this.database.fetch(offset).then(result => {

            this.people = [];
            
            console.clear();
            console.log('result',result)

            this.total_rows=Math.ceil(result.total_rows/5);

            for(let i = 0; i < result.rows.length; i++) {

                this.people.push(result.rows[i].doc);

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
    public deleteHtml(id) 
    {
        console.log('before delete',this.people)
        const result =  this.people.find( _db => _db._id === id);

        console.log(result,'after delete',this.people)
    }
    public pageChanged(event){
       console.log(event)  
    }
}
