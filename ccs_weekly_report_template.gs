const uProp = PropertiesService.getUserProperties();

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Insert Template', 'insertTemplate')
      .addSeparator()
      .addItem('Settings', 'showConfig')
      .addToUi();

  initProperties();
}

function onInstall(e) {
  onOpen(e);
}

function initProperties(){
  if(!uProp.getProperty("tempUrl")){
     uProp.setProperty("tempUrl", "https://docs.google.com/document/d/1jRBb-I7rWudK9bGpDn8TkE-QZhNtzynKWhqtJhsCDdw/edit#");
  }
  if(!uProp.getProperty("dateFormat")){
    uProp.setProperty("dateFormat", "YYYY-MM-DD");
  }
  if(!uProp.getProperty("dateOffset")){
    uProp.setProperty("dateOffset", "1");
  }
  if(!uProp.getProperty("bPageBreak")){
    uProp.setProperty("bPageBreak", "true");
  }
}

function showConfig(){
  const htmlTemplate = HtmlService.createTemplateFromFile('config_dialog')
  htmlTemplate.savedConfig = PropertiesService.getUserProperties().getProperties();
  const ui = htmlTemplate.evaluate().setHeight(425).setWidth(600);

  DocumentApp.getUi().showModalDialog(ui,'Template settings');
}

function saveConfig(formObj){
  uProp.setProperties(formObj);
  if(!formObj.bPageBreak){
    uProp.setProperty("bPageBreak", "false");
  }else{
    uProp.setProperty("bPageBreak", "true");
  }
}

function insertTemplate() {
  const doc = DocumentApp.getActiveDocument();
  const thisBody = doc.getBody();
  const uPropData = uProp.getProperties();

  const tempUrl = uPropData.tempUrl;
  const dateFormat = uPropData.dateFormat;
  const dateOffset = uPropData.dateOffset;
  const bPageBreak = uPropData.bPageBreak;

  let templateBody = DocumentApp.openByUrl(tempUrl).getBody().copy();
  let mtgDate = dayjs.dayjs().add(parseInt(dateOffset),"day");
  dateStr = mtgDate.format(dateFormat);
  templateBody.replaceText('\\$\{mtg_date\}',dateStr);
  // templatefield = SpreadsheetApp.openById("1FwLvsN7eciMn6oJkk5K2Xd4Xi9ptcNPoGG7IW6dDn5o")

  let childIndex = 0;
  for(let i=0; i<templateBody.getNumChildren();i++){ //run through the elements of the template doc's Body.
    const element = templateBody.getChild(i);
    switch (element.getType()) { //Deal with the various types of Elements we will encounter and append.
      case DocumentApp.ElementType.PARAGRAPH:
        let paragraph = element.asParagraph()
        thisBody.insertParagraph(i, element.copy());
        childIndex += 1;
        break;
      case DocumentApp.ElementType.LIST_ITEM:
        let glyphType = element.asListItem().getGlyphType()
        thisBody.insertListItem(i, element.copy()).setGlyphType(glyphType);
        childIndex += 1;
        break;
      case DocumentApp.ElementType.TABLE:
        thisBody.insertTable(i, element.copy());
        childIndex += 1;
        break;
      case DocumentApp.ElementType.UNSUPPORTED:
        doc.alert("Templete contains unsupported element");
        break;
      default:
        doc.alert("Templete contains unknown element");
    }
  }
  
  if(bPageBreak==="true"){
    thisBody.insertPageBreak(childIndex);
  }
}