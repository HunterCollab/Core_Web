import { CollabsService } from 'src/app/shared/dbAccess/collabs.service';
import { UserService } from './../../shared/dbAccess/user.service';
import { CollabModel } from './../../shared/models/collab.model';
import { Component, OnInit, Input } from '@angular/core';
import { TableBuilder } from 'src/app/shared/models/tableBuilder.model';
import { UserModel } from 'src/app/shared/models/user.model';
import { Router } from '@angular/router';

export interface Requirements{
  skillOrClass: string,
  type: string
}

@Component({
  selector: 'collab-card',
  templateUrl: './collab-card.component.html',
  styleUrls: ['./collab-card.component.css']
})
export class CollabCardComponent implements OnInit {

  @Input() collabData: CollabModel;
  table: Array<TableBuilder> = [];  
  xAxisReq: Array<string> = [];
  yAxisUsers: any
  alreadyBuilt: boolean = false;
  partOf = false; 
  isOwner = false; 

  //Will hold our user data.
  userData: UserModel[];
  

  constructor(private userService: UserService, 
              private collabService: CollabsService,
              private router: Router) {
               
                
              }

  async ngOnInit() {
    await this.userService.getUserdetails().subscribe(userData => this.userData = userData);
    
  }

  /*
  Function that will build our table. 
  async: Will allow us to do await functions
  */
  async makeTable(){

    if(this.alreadyBuilt){

    } else {
    this.alreadyBuilt = true;
    //Will store the list of users.
    let yAxisUsers : string[];

    //Fuction will stop here until function getAllRequred returns
    this.xAxisReq = await this.getAllRequired(); 
    
    //Will members of the collaboration
    yAxisUsers  = this.collabData.members;
    //console.log("Skills Required: " , xAxisReq);
    
    //Will loop through all the users and check if they know the required skills and classes
    for(let y of yAxisUsers){
      //console.log(x, " is being checked");

        //Will hold a single instance of TableBuilder modle
        let tableRow = await this.checkIfKnown(y,this.xAxisReq);
        this.table.push(tableRow);
        //console.log(tableRow);
     }
    }
    
  }

  RefreshPage(){
    this.getAllRequired();
    //Will members of the collaboration
    this.yAxisUsers  = this.collabData.members;
  } 
  
  //WIll check if a user knows skill or class, from the list of classes and skills that a user knows
  async checkIfKnown(userName: string, listOfRequired: string[]){
    let tmp: TableBuilder = null;

    tmp = new TableBuilder(userName);

    let knownByUser;
   
    for(let x of listOfRequired){
      
      //Will return both skills and classes in a single array
      await this.userService.getUserSkillsAndClasses(userName).then(function(result){
        knownByUser = result;
      });
      
      if(knownByUser.includes(x)){
        //console.log(userName , " knows ", x);
        tmp.setKnown(x,true);
        
      } else {
        //console.log(userName , " doesn't know ", x);
        tmp.setKnown(x,false);
      }
    }
    
    return tmp;
  }

  getAllRequired(){
    let xAxisReq: Array<string> = [];
    xAxisReq = (this.collabData.skills).concat(this.collabData.classes);

    return xAxisReq;
  }
  
  async actionCheck(){
    await this.isUserOwner();
    this.isPartOf();
  }
  isUserOwner(){
    console.log(this.userData['username']);
    if(this.collabData.owner == this.userData['username']){
      this.isOwner = true;
    } else {
      this.isOwner = false;
    }
  }

  isPartOf(){
    for(let member of this.collabData.members){
      if(member == this.userData['username']){
        this.partOf = true;
      } 
    }

    console.log(this.partOf);
  }

  checkPartOf(){
    return this.partOf;
  }

  checkOwner(){
    return this.isOwner;
  }
  
  joinCollab(){
    this.collabService.joinCollab(this.collabData._id)
      .subscribe(res => { console.log(res) });
  }

  leaveCollab(){
    this.collabService.leaveCollab(this.collabData._id)
      .subscribe(res => {console.log(res) })
  }

  deleteCollab(){
    this.collabService.deleteCollab(this.collabData._id)
      .subscribe(res => {console.log(res) })
  }

  editCollab(){
    console.log(this.collabData._id);
    this.router.navigate(['/home/editcollab/',this.collabData._id["$oid"]]);
  }


}
