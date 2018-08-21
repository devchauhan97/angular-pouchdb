import { Component, OnInit,NgZone,Output,EventEmitter  } from '@angular/core';
import { UserService } from '../service/user.service';
import { IAddForm ,IEditForm,IFriend} from '../service/user.model';
 
import { BookService } from "../shared/service/book.service";
@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})

export class BookComponent implements OnInit {

    public books: Array<any>;
    public form: any;
    public page: any;
     
    @Output() pageChange: EventEmitter<number> = new EventEmitter();
    total_rows: number ;

    public constructor(private bookdatabase: BookService, private zone: NgZone) {
        this.books = [];
        this.page = 0;
        this.form = {
            "bookname": "",
            "price": "",
           
        }
    }

    public ngOnInit() {

        this.bookdatabase.sync("http://192.168.1.109:9000/books");

        this.bookdatabase.getLiveBookChangeListener().subscribe(data => {
            console.log('live listiner',data)
            for(let i = 0; i < data.change.docs.length; i++) 
            {
                console.log('live subscribe',data)
                this.getall(this.page)
            }
        });

        this.bookdatabase.getLocalBookChangeListener().subscribe(data => {
            
            console.log('local subscribe',data)
            this.getall(this.page)
        });

        this.getall(this.page);
    }

    public getall(offset:string){

        this.zone.run(() => {
            this.books=[];
        })
        this.bookdatabase.fetch(offset).then(result => {
           //this.books = [];
            for(let i = 0; i < result.rows.length; i++) {
                this.zone.run(() => {
                    this.books.push(result.rows[i].doc);
                })

            }
           // if(result.rows.length == 0)
            console.log('books',this.books)
        }, error => {
            console.error(error);
        });
    }

    public insert() {
        if(this.form.bookname && this.form.price) {
            this.bookdatabase.put(this.form.id, this.form);
            this.form = {
                "bookname": "",
                "price": "",
            }
        }
    }

    public delete(id) {

        if(id) 
        {
           let res= this.bookdatabase.delete(id);
           
        }
    }
    public update(id) 
    {
        //const result =  this.books.find( _db => _db._id === id);
        let res= this.bookdatabase.get(id).then(result => {
            this.form = {
                    "bookname": result.bookname,
                    "price": result.price,
                    "id": result._id,
                }
        });
        //console.log('before delete',res)
        console.log('after delete',this.form)
    }
    public pageChanged(event){
       console.log(event)  
    }

}
