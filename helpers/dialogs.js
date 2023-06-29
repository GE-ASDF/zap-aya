const dialogs = [
        {
            dialog_1:[
                {
                    stage:""
                }
            ]
        },
        {
            dialog_2:
        }    
]

console.log("Diálogo", dialogs.find((dialog)=>{
    return dialog.dialog_1;
}))