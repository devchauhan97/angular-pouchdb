import { Injectable,EventEmitter } from '@angular/core';
import  PouchDB from "pouchdb";

@Injectable({
  providedIn: 'root'
})
export class PouchDBService {

    private isInstantiated: boolean;
    private database: any;
    private listener: EventEmitter<any> = new EventEmitter();
    private localListener: EventEmitter<any> = new EventEmitter();

    private pull:any;

    public constructor() {
        if(!this.isInstantiated) {
            this.database = new PouchDB("nraboy");
            this.isInstantiated = true;
        }

        this.database.changes({
            include_docs: true,
            //since: 'now',
            live: true,
        }).on("change", change => { 

            console.log('local change',change)
            if (change.deleted) {
              // change.id holds the deleted id
              //onDeleted(change.id);
            } else { // updated/inserted
              // change.doc holds the new doc
              
                this.localListener.emit(change);
            }
        }).on('error', error => {
            console.error(JSON.stringify(error));
        });

    }

    public fetch() {
        return this.database.allDocs({include_docs: true});
    }

    public get(id: string) {
        return this.database.get(id);
    }

    public put(id: string, document: any) {

        document._id = ( "u:" + ( new Date() ).getTime() );
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.database.put(document);
        }, error => {
            console.log('error',error);
            if(error.status == "404") {
                return this.database.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    public sync(remote: string) {

        let remoteDatabase = new PouchDB(remote);
       
            this.database.sync(remoteDatabase, {
                live: true,
                retry: true 
            }).on('change', change => {
               console.log('live change',change)

                if (change.direction == "pull") 
                {
                  this.listener.emit(change);
                } 
                else 
                { // updated/inserted
                  // change.doc holds the new doc
                  this.database.closed()
                }
               //
            }).on('paused', (err) =>{
              console.log('paused');
              if (err) {
                alert(`No connection! ${err}`);
              }
              // replication was paused, usually because of a lost connection
            }).on('active', (info)=>{
                console.log('active');
              // replication was resumed
            }).on('error', error => {
                 
                console.log('error');
                //console.error(JSON.stringify(error));
            }) 
    }

    public getChangeListener() {
        return this.listener;
    }

    public getLocalChangeListener() {
        return this.localListener;
    }

    public delete(id: string ) {
         
        return this.get(id).then(result => {
           return this.database.remove(result);
        }, error => {
            if(error.status == "404") {
                console.log('errror')
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    

}
