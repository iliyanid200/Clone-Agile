import './App.css';
import React,{ useState } from 'react'
import FileSaver from 'file-saver'


import manifest from './Template/manifest.json'
import apisMaps from './Template/Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/apisMap.json'
import connectionsMap from './Template/Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/connectionsMap.json'
import definitions from './Template/Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/definition.json'
import deepManifest from './Template/Microsoft.Flow/flows/manifest.json'
function App() {
  const [emails,setEmails] = useState([""])
  const[classTimes,setClassTimes] = useState(["",""])
  const[classForms,setClassForms] = useState(["",""]);
  const[classDetails,setClassDetails] = useState(["",""])
  const updateClassDetails = (detail,index) =>{
    let temp = [...classDetails];
    temp[index] = detail;
    setClassDetails(temp);
  }
  const updateClassFomrs = (formURL,index) =>{
    if(formURL[formURL.length - 1] !== 'm'){
      let temp = [...classForms];
      temp[index] = formURL;
      setClassForms(temp);
    }
  }
  const updateClassTimes = (time,index) =>{
    let temp = [...classTimes];
    temp[index] = time;
    setClassTimes(temp);
    console.log(temp);
  }

  const updateEmails=(email,index)=>{
    let tempEmail = [...emails];
    tempEmail[index] = email;
    setEmails(tempEmail);
  }
  const removeEmail=(index)=>{
    let tempEmail = [...emails];
    tempEmail.splice(index,1);
    setEmails(tempEmail);
  }
  const addEmail = () =>{
    let tempEmail = [...emails];
    tempEmail.push("");
    setEmails(tempEmail);
  }

  const generateTemplates = (e) =>{
    e.preventDefault();

    //Set class name
    let className = classDetails[0]
    manifest.resources["68d2d327-aeac-404b-b895-8fc5260d3d23"].details.displayName = className + " Register";
    definitions.properties.displayName = className;

    //Set Form Trigger ID
    let formID = classForms[0].substr(classForms[0].indexOf('=')+1);
    definitions.properties.definition.triggers["When_a_new_response_is_submitted"].inputs.parameters.form_id = formID;
    definitions.properties.definition.actions["Get_response_details"].inputs.parameters.form_id = formID;

    //Create WorkSheet
    definitions.properties.definition.actions["Create_worksheet"].inputs.parameters['body/name'] = className;

    //Create Table
    definitions.properties.definition.actions["Create_table"].inputs.parameters['table/TableName'] = className + "RegisterTable";

    //Add to Table
    definitions.properties.definition.actions["Add_a_row_into_a_table"].inputs.parameters.table = className + "RegisterTable";
    
    //Set Send Email
    definitions.properties.definition.actions["Send_an_email_notification_(V3)"].inputs.parameters["request/subject"] = "Succesfull Registration for " + className;
    definitions.properties.definition.actions["Send_an_email_notification_(V3)"].inputs.parameters["request/text"] = "<p>Congradulations you have been added succesfully.<br>\nYour Instructors Email's Are:<br>\n" + emails.map((email)=>{return email + "<br>\n"}) + "Use this link if you need to be removed from the course: <br>\n<br>\n" + classForms[1] + "</p>"

    //Set Calender Creation
    let classStartTime = classTimes[0] + ":00";
    let classEndTime = classTimes[0].substr(0,10) + classTimes[1].substr(10) +":00";
    let classDays = (parseInt(classTimes[1].substr(8,11)) - parseInt(classTimes[0].substr(8,11))) + 1;
    console.log(classStartTime);
    console.log(classEndTime);
    console.log(classDays);

    let classLink = classDetails[1];
    definitions.properties.definition.actions["Create_event_(V4)"].inputs.parameters["item/subject"] = className;
    definitions.properties.definition.actions["Create_event_(V4)"].inputs.parameters["item/start"] = classStartTime;
    definitions.properties.definition.actions["Create_event_(V4)"].inputs.parameters["item/end"] = classEndTime;
    definitions.properties.definition.actions["Create_event_(V4)"].inputs.parameters["item/body"] = "<p>Class: " + className +"<br>\nYour Instructors Email's Are:<br>\n" + emails.map((email)=>{return email + "<br>\n"}) + "Course Link: " + classLink + "</p>"
    definitions.properties.definition.actions["Create_event_(V4)"].inputs.parameters["item/numberOfOccurences"] = classDays;

    //Zip and Download File
    let zip = require('jszip')();
    zip.file("manifest.json", JSON.stringify(manifest));
    zip.file("Microsoft.Flow/flows/manifest.json",JSON.stringify(deepManifest));
    zip.file("Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/apisMap.json",JSON.stringify(apisMaps));
    zip.file("Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/connectionsMap.json",JSON.stringify(connectionsMap));
    zip.file("Microsoft.Flow/flows/68d2d327-aeac-404b-b895-8fc5260d3d23/definition.json",JSON.stringify(definitions));

    zip.generateAsync({type:"blob"}).then((blob) => { 
        FileSaver.saveAs(blob, className + "Template.zip");
        window.open("https://us.flow.microsoft.com/manage/environments/Default-6416915b-6778-4c36-ba4f-e56ff64a8bb7/flows/import");
    }, (err) => {
        console.log(err)
    });

};
  return (
    <div className="App">
      <img id="travelport_logo" alt="Travelport" title="Travelport" src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgOTYuNjEiPjxwYXRoIGQ9Ik00OC4zLDBBNDguMzEsNDguMzEsMCwxLDAsOTYuNjEsNDguMyw0OC4zMSw0OC4zMSwwLDAsMCw0OC4zLDBabTcuOTMsNzEuNzNMNDMuNjUsODQuMzFWMzkuMTFMNTYuMjMsNTEuNjlaTTczLjc1LDM5LjE0LDYxLjE3LDUxLjcyVjM0LjE3SDE4LjQ2TDMxLDIxLjU4SDczLjc1WiIvPjxwb2x5Z29uIHBvaW50cz0iMzg3LjI0IDIxLjY0IDM2OS4zNyA2Ny40NCAzNTEuNCAyMS42NCAzMzkuNTUgMjEuNjQgMzYyLjY2IDgwLjAzIDM3NS45OCA4MC4wMyAzOTkuMSAyMS42NCAzODcuMjQgMjEuNjQiLz48cG9seWdvbiBwb2ludHM9IjQxNy4xMSAyMS42NCA0MTcuMTEgODAuMDMgNDU2Ljg0IDgwLjAzIDQ1Ni44NCA3MC4wMiA0MjcuMjEgNzAuMDIgNDI3LjIxIDU1LjgyIDQ1MC43OCA1NS44MiA0NTAuNzggNDUuODEgNDI3LjIxIDQ1LjgxIDQyNy4yMSAzMS42NSA0NTYuODQgMzEuNjUgNDU2Ljg0IDIxLjY0IDQxNy4xMSAyMS42NCIvPjxwb2x5Z29uIHBvaW50cz0iNDgwLjUyIDIxLjY0IDQ4MC41MiA4MC4wMyA1MjAuMjUgODAuMDMgNTIwLjI1IDcwLjAyIDQ5MC42MiA3MC4wMiA0OTAuNjIgMjEuNjQgNDgwLjUyIDIxLjY0Ii8+PHBhdGggZD0iTTU2Ni41NCw0Ny41OUg1NDkuODFWMzEuNjVoMTYuNzNjNS40OSwwLDguNDgsMyw4LjQ4LDcuOTIsMCw1LjEtMyw4LTguNDgsOG0uNjUtMjUuOTVINTM5LjcyVjgwaDEwLjA5VjU3LjZoMTcuMzhjMTEuMywwLDE3LjkzLTcuNDMsMTcuOTMtMTgsMC0xMC40Mi02LjcxLTE3LjkzLTE3LjkzLTE3LjkzIi8+PHBhdGggZD0iTTYyOS44Miw3MS4yN0M2MTguMSw3MS4yNyw2MTAsNjIuNjgsNjEwLDUxYzAtMTEuODQsOC4yNC0yMC42LDE5Ljc5LTIwLjZzMTkuOCw4Ljc2LDE5LjgsMjAuNi04LjI0LDIwLjI3LTE5LjgsMjAuMjdtLjA5LTUwLjg4Yy0xOC4xLDAtMzAuNSwxMy41MS0zMC41LDMwLjYxczEyLjQsMzAuMjgsMzAuNSwzMC4yOGMxNy45MiwwLDMwLjMzLTEzLjI2LDMwLjMzLTMwLjI4cy0xMi40MS0zMC42MS0zMC4zMy0zMC42MSIvPjxwYXRoIGQ9Ik03MDUuNzgsNDcuNTlINjg4LjcyVjMxLjY1aDE3LjA2YzUuMzMsMCw4LjU2LDMsOC41Niw3LjkyLDAsNS4xLTMuMjMsOC04LjU2LDhtMTguNjYtOGMwLTEwLjQyLTctMTcuOTMtMTgtMTcuOTNoLTI3LjhWODBoMTAuMDlWNTcuNTloMTVsMTAuMSwyMi41MmgxMWwtMTEtMjMuODVjNi42Mi0yLjU5LDEwLjU4LTguNzYsMTAuNTgtMTYuNjkiLz48cGF0aCBkPSJNMjQwLjI5LDQ3LjU5SDIyMy4yM1YzMS42NWgxNy4wNmM1LjMzLDAsOC41NiwzLDguNTYsNy45MiwwLDUuMS0zLjIzLDgtOC41Niw4bTE4LjY2LThjMC0xMC40Mi03LTE3LjkzLTE4LTE3LjkzaC0yNy44VjgwaDEwLjA5VjU3LjU5aDE1LjA1bDEwLjA5LDIyLjUyaDExbC0xMS0yMy44NUMyNTUsNTMuNjcsMjU5LDQ3LjUsMjU5LDM5LjU3Ii8+PHBvbHlnb24gcG9pbnRzPSI3NDUuOTYgMjEuNjQgNzM1Ljk1IDMxLjY1IDc2MS4zNCAzMS42NSA3NjEuMzQgODAuMDMgNzcxLjQ0IDgwLjAzIDc3MS40NCAzMS42NSA3ODkuOTkgMzEuNjUgODAwIDIxLjY0IDc0NS45NiAyMS42NCIvPjxwYXRoIGQ9Ik0zMDUsMzMuMjUsMzE1LjI1LDYwSDI5NC43M1ptLTYtMTEuNjFMMjc2LjA2LDgwaDExbDMuODUtMTBoMjguMThsMy44MywxMEgzMzRMMzExLDIxLjY0WiIvPjxwb2x5Z29uIHBvaW50cz0iMTQ1LjAxIDIxLjY0IDEzNSAzMS42NSAxNjAuNCAzMS42NSAxNjAuNCA4MC4wMyAxNzAuNDkgODAuMDMgMTcwLjQ5IDMxLjY1IDE4OS4wNCAzMS42NSAxOTkuMDUgMjEuNjQgMTQ1LjAxIDIxLjY0Ii8+PC9zdmc+"></img>
      <h1>Class Automation Tool 2</h1>
      <form onSubmit={generateTemplates}>
        <div className='container'>
        <div className='classForms'>
            <div>
              <h3>Class Name</h3>
              <input onChange={(e)=>updateClassDetails(e.target.value,0)} required/>
            </div>
            <div>
              <h3>Meeting Link</h3>
              <input onChange={(e)=>updateClassDetails(e.target.value,1)} required/>
            </div>
          </div>
          <div className='classDate'>
            <h2>Class Dates</h2>
            <div>
              <h3>Start Date</h3>
              <input onChange={(e)=>updateClassTimes(e.target.value,0)} required type="datetime-local"/>
            </div>
            <div>
              <h3>End Date</h3>
              <input onChange={(e)=>updateClassTimes(e.target.value,1)} required type="datetime-local"/>
            </div>
            
          </div>
          <div className='classEmails'>
            <h2>Class Teacher's Emails</h2>
            {emails.map((email,index)=>{return(
                <div>
                  <input type='email' required onChange={(e)=>{e.preventDefault();updateEmails(e.target.value,index)}}/>
                  <button onClick={(e)=>{e.preventDefault();removeEmail(index);}}>Remove Email</button>
                </div>
            )})}

            <button onClick={(e)=>{e.preventDefault();addEmail();}}>Add Email</button>
          </div>
          <div className='classForms'>
            <h2>Form URLs</h2>
            <div>
              <h3>Sign Up Form URL</h3>
              <input value={classForms[0]} onChange={(e)=>updateClassFomrs(e.target.value,0)} required/>
            </div>
            <div>
              <h3>Drop Class Form URL</h3>
              <input value={classForms[1]} onChange={(e)=>updateClassFomrs(e.target.value,1)} required/>
            </div>
          </div>
          <input type="submit"  value='Generate Template' className='generateTemplate'></input>
          
        </div>
      </form>



    </div>
  );
}

export default App;
