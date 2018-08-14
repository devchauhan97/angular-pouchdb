import { Injectable } from '@angular/core';
import  PouchDB from "pouchdb";

import {IFriend,IPouchDBPutResult,IPouchDBGetFriendResult,
		IPouchDBRemoveResult,

		IPouchDBAllDocsResult} from './user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {

   private pouch: any;


    // I initialize the Friend service.
    constructor() {

        this.pouch = new PouchDB(
            "javascript-demos-pouchdb-angular2",
            {
                // PouchDB doesn't overwrite data - it creates revisions (like Git).
                // For the purposes of this app, however, we don't need those revisions
                // to stay around, taking up storage space. By enabling auto_compaction,
                // PouchDB will only keep the most current revision in storage.
                auto_compaction: true
            }
        );

    }


    // ---
    // PUBLIC METHODS.
    // ---

    // I add a new friend with the given name. Returns a promise of the generated id.
    public addFriend( name: string ) : Promise<string> {

        // NOTE: All friends are given the key-prefix of "friend:". This way, when we go
        // to query for friends, we can limit the scope to keys with in this key-space.
        var promise = this.pouch
            .put({
                _id: ( "friend:" + ( new Date() ).getTime() ),
                name: name
            })
            .then(
                ( result: IPouchDBPutResult ) : string => {

                    return( result.id );

                }
            )
        ;

        return( promise );

    }


    // I delete the friend with the given id. Returns a promise.
    public deleteFriend( id: string ) : Promise<void> {

        this.testId( id );

        // When we delete a document, we have to provide a document that contains, at the
        // least, the "_id" and the "_rev" property. Since the calling context doesn't
        // have this, we'll use the .get() method to get the current doc, then use that
        // result to delete the winning revision of the document.
        var promise = this.pouch
            .get( id )
            .then(
                ( doc: IPouchDBGetFriendResult ) : any => {

                    return( this.pouch.remove( doc ) );

                }
            )
            .then(
                ( result: IPouchDBRemoveResult ) : void => {

                    // Here, I'm just stripping out the result so that the PouchDB
                    // response isn't returned to the calling context.
                    return;

                }
            )
        ;

        return( promise );

    }


    // I get the collection of friends (in no particular sort order). Returns a promise.
    public getFriends() : Promise<IFriend[]> {

        var promise = this.pouch
            .allDocs({
                include_docs: true,

                // In PouchDB, all keys are stored in a single collection. So, in order
                // to return just the subset of "Friends" keys, we're going to query for
                // all documents that have a "friend:" key prefix. This is known as
                // "creative keying" in the CouchDB world.
                startkey: "friend:",
                endKey: "friend:\uffff"
            })
            .then(
                ( result: IPouchDBAllDocsResult ) : IFriend[] => {

                    // Convert the raw data storage into something more natural for the
                    // calling context to consume.
                    var friends = result.rows.map(
                        ( row: any ) : IFriend => {

                            return({
                                id: row.doc._id,
                                name: row.doc.name
                            });

                        }
                    );

                    return( friends );

                }
            )
        ;

        return( promise );

    }


    // I sort the given collection of friends (in place) based on the name property.
    public sortFriendsCollection( friends: IFriend[] ) : IFriend[] {

        friends.sort(
            function( a: IFriend, b: IFriend ) : number {

                if ( a.name.toLowerCase() < b.name.toLowerCase() ) {

                    return( -1 );

                } else {

                    return( 1 );

                }

            }
        );

        return( friends );

    }


    // I test the given id to make sure it is valid for the Friends key-space. Since all
    // PouchDB documents are stored in a single collection, we have to ensure that the
    // given ID pertains to the subset of documents that represents Friends. If the id is
    // valid, I return quietly; otherwise, I throw an error.
    public testId( id: string ) : void {

        if ( ! id.startsWith( "friend:" ) ) {

            throw( new Error( "Invalid Id" ) );

        }

    }


    // I update the friend with the given id, storing the given name. Returns a promise.
    public updateFriend( id: string, name: string ) : Promise<void> {

        this.testId( id );

        // When we update an existing document in PouchDB, we have to provide the "_rev"
        // of the document we're updating, otherwise PouchDB will throw a conflict.
        // However, since the calling context does not have the "_rev", we'll fetch the
        // document first, then update it in place, and put the resultant document back
        // into PouchDB (which will create a new revision).
        var promise = this.pouch
            .get( id )
            .then(
                ( doc: IPouchDBGetFriendResult ) : Promise<IPouchDBPutResult> => {

                    doc.name = name;

                    return( this.pouch.put( doc ) );

                }
            )
            .then(
                ( result: IPouchDBPutResult ) : void => {

                    // Here, I'm just stripping out the result so that the PouchDB
                    // response isn't returned to the calling context.
                    return;

                }
            )
        ;

        return( promise );

    }

}
