import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { IAddForm ,IEditForm,IFriend} from '../service/user.model';

import { ISyncResult } from "../service/pouchdb.model";
import { PouchdbService } from "../service/pouchdb.service";
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  	public addForm: IAddForm;
    public editForm: IEditForm;
    public friends: IFriend[];
    public user: string;

    private UserService: UserService;

    private pouchdbService: PouchdbService;
    // I initialize the component.
    constructor( UserService: UserService ,
        pouchdbService: PouchdbService) {

        this.UserService = UserService;
        this.pouchdbService = pouchdbService;

        this.addForm = {
            name: ""
        };
        this.editForm = {
            id: null,
            name: ""
        };
        this.friends = [];
        this.user = null;
    }

    // I login the user with the given identifier.
    public login( userIdentifier: string ) : void {

        // In order to keep this demo as simple as possible, I've already created the two
        // remote databases in Cloudant (CouchDB as a Service) and have provisioned API
        // keys for them (one for each remote database), which I am hard-coding here.
        // When the user logs-in, they will be able to sync with the associated remote
        // database in our database-per-user model.
        // --
        // NOTE: I am not doing any automatic sync because sync => HTTP requests to
        // Cloudant, which has a dollars-and-cents cost to it. In each application, you
        // have to figure out where the right balance of real-time syncing, usability,
        // and cost can be found.
        var demoCredentials = {
            ben: {
                local: {
                    identifier: "ben"
                },
                remote: {
                    url: "https://bennadel.cloudant.com/js-demo-pouchdb-cloudant-sync-ben",
                    key: "sedenawaysizediesettedur",
                    password: "3c9b6ca8303e9b34e42296c87a22aa1223ad7770"
                }
            },
            kim: {
                local: {
                    identifier: "kim"
                },
                remote: {
                    url: "https://bennadel.cloudant.com/js-demo-pouchdb-cloudant-sync-kim",
                    key: "tintralowallsedidiatedis",
                    password: "209e6040a87352e428fcb3c8f6b922924c300ddc"
                }
            }
        };

        // Now that a new user is logging in, we want to teardown any existing PouchDB
        // database and reconfigure a new PouchDB setup for the the current user. This
        // includes both the local database as well as the remote CouchDB (Cloudant)
        // database acting as our remote replica. This way, each user gets their own
        // database in our database-per-user model.
        // --
        // CAUTION: For simplicity, this is in the app-component; but, it should probably
        // be encapsulated in some sort of "session" service.
        this.pouchdbService.configureForUser( demoCredentials[ userIdentifier ] );
        this.user = userIdentifier;

        // Once the new database is configured (synchronously), load the user's friends.
        this.loadFriends();

    }


    // I log the current user out.
    public logout() : void {

        // When logging the user out, we want to teardown the currently configured
        // PouchDB database. This way, we can ensure that rogue asynchronous actions
        // aren't going to accidentally try to interact with the database.
        this.pouchdbService.teardown();
        this.user = null;

        this.friends = [];

    }
    public syncData() : void {

        console.info( "Synchronizing remote database." );

        this.pouchdbService
            .sync()
            .then(
                ( results: ISyncResult ) : void => {

                    // When we "sync" the two databases, documents may move in either
                    // direction - Push or Pull. And, since this is performed using
                    // "bulk" operations, it's possible that some of the documents will
                    // create errors (version conflicts) while each overall request still
                    // completes successfully.
                    console.group( "Remote sync completed." );
                    console.log( "Docs pulled:", results.pull.docs.length );
                    console.log( "Docs pushed:", results.push.docs.length );
                    console.log( "Errors:", ( results.pull.errors.length + results.push.errors.length ) );
                    console.groupEnd();

                    // We don't really care if we PUSHED docs to the remote server; but,
                    // if we PULLED new docs down, we'll want to re-render the list of
                    // friends to display the newly acquired documents.
                    if ( results.pull.docs.length ) {

                        console.log( `Since we pulled ${ results.pull.docs.length } docs, re-render friends.` );
                        this.loadFriends();

                    }

                    // Since replication / syncing is performed using bulk operations,
                    // it's possible that some of the documents failed to replicate due
                    // to version conflicts - warn for errors.
                    if ( results.pull.errors.length || results.push.errors.length ) {

                        console.warn( "Some of the documents resulted in error:" );
                        console.log( results.pull.errors );
                        console.log( results.push.errors );

                    }

                },
                ( error: any ) : void => {

                    console.warn( "Remote sync failed, critically." );
                    console.error( error );

                }
            )
        ;

    }


    
    // ---
    // PUBLIC METHODS.
    // ---

    // I delete the given friend from the list.
    public deleteFriend( friend: IFriend ) : void {

        this.UserService
            .deleteFriend( friend.id )
            .then(
                () : void => {

                    this.loadFriends();

                },
                ( error: Error ) : void => {

                    console.log( "Error:", error );

                }
            )
        ;

    }


    // I toggle the edit form for the given friend.
    public editFriend( friend: IFriend ) : void {

        // If the method is being called for the already-selected friend, then let's
        // toggle the form closed.
        if ( this.editForm.id === friend.id ) {

            this.editForm.id = null;
            this.editForm.name = "";

        } else {

            this.editForm.id = friend.id;
            this.editForm.name = friend.name;

        }

    }


    // I get called once after the component has been initialized and the inputs have
    // been bound for the first time.
    public ngOnInit() : void {

        this.loadFriends();

    }


    // I process the "add" form, creating a new friend with the given name.
    public processAddForm() : void {

        if ( ! this.addForm.name ) {

            return;

        }

        this.UserService
            .addFriend( this.addForm.name )
            .then(
                ( id: string ) : void => {

                    console.log( "New friend added:", id );

                    this.loadFriends();
                    this.addForm.name = "";

                },
                ( error: Error ) : void => {

                    console.log( "Error:", error );

                }
            )
        ;

    }


    // I process the "edit" form, updating the selected friend with the given name.
    public processEditForm() : void {

        // If the name has been removed, then treat this as a "cancel".
        if ( ! this.editForm.name ) {

            this.editForm.id = null;
            this.editForm.name = "";
            return;

        }

        this.UserService
            .updateFriend( this.editForm.id, this.editForm.name )
            .then(
                () : void => {

                    this.editForm.id = null;
                    this.editForm.name = "";
                    this.loadFriends();

                },
                ( error: Error ) : void => {

                    console.log( "Error:", error );

                }
            )
        ;

    }


    // ---
    // PRIVATE METHODS.
    // ---

    // I load the persisted friends collection into the list.
    private loadFriends() : void {

        this.UserService
            .getFriends()
            .then(
                ( friends: IFriend[] ) : void => {

                    // NOTE: Since the persistence layer is not returning the data
                    // in any particular order, we're going to explicitly sort the
                    // collection by name.
                    this.friends = this.UserService.sortFriendsCollection( friends );

                },
                ( error: Error ) : void => {

                    console.log( "Error", error );

                }
            )
        ;

    }
}
