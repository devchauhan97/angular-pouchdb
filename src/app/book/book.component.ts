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

        this.bookdatabase.sync("http://192.168.1.49:9000/books");

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

         this.bookdatabase.fetch(offset).then(result => {

            this.books = [];
            
            console.log('result',result)

            //this.total_rows=Math.ceil(result.total_rows/5);

            for(let i = 0; i < result.rows.length; i++) {

                this.books.push(result.rows[i].doc);

            }
            console.log('books',this.books)
        }, error => {
            console.error(error);
        });
    }

    public insert() {
        if(this.form.bookname && this.form.price) {
            this.bookdatabase.put(this.form.bookname, this.form);
            this.form = {
                "bookname": "",
                "price": "",
            }
        }
    }

    public delete(id) {

        if(id) {
           let res= this.bookdatabase.delete(id);
           // console.log(res)
           // this.getResult();
        }
    }
    public deleteHtml(id) 
    {
        console.log('before delete',this.books)
        const result =  this.books.find( _db => _db._id === id);

        console.log(result,'after delete',this.books)
    }
    public pageChanged(event){
       console.log(event)  
    }

}
