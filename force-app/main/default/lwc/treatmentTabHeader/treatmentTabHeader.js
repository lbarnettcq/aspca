import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import FORM_FACTOR from '@salesforce/client/formFactor';
import getActiveTreatmentPlan from '@salesforce/apex/TreatmentTabHeaderController.getActiveTreatmentPlan';

export default class TreatmentTabHeader extends NavigationMixin(LightningElement) {
    @api
    recordId;
    showModal = false;
    showNewSessionModal = false;
    showNewTreatmentModal = false;

    treatmentPlan = 'noPlan';

    @wire(getActiveTreatmentPlan, { animalId : '$recordId' })
    wiredTreatmentPlan(result) {
        window.console.log('result: ', JSON.stringify(result));
        if(result.data){

            this.treatmentPlan = result.data;
        }
        // else if (result.error) {
        //     const evt = new ShowToastEvent({
        //         title: 'Error',
        //         message: result.error,
        //         variant: 'error',
        //     });
        //     this.dispatchEvent(evt);
        // }
    }

    handleClick() {
        this.showModal = true;
        this.showNewTreatmentModal = true;
    }

    handleCancel() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
        this.showModal = false;
        this.showNewTreatmentModal = false;
        this.showNewSessionModal = false;
    }
    
    handleSubmit(event){
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Animal__c = this.recordId;
        if(this.customLookupNewId != undefined){
            fields.AssignedTreatmentBundleId__c = this.customLookupNewId;
        }
        window.console.log('fields: ', JSON.stringify(fields));
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event) {
        this.showModal = false;
        let treatmentId = event.detail.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: treatmentId,
                actionName: 'view',
            }
        });
    }

    handlePdf() {
        let url = '/apex/Last5TreatmentsReport?animalId=' + this.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }

    handleNewSession(){
        window.console.log('new session');
        this.showModal = true;
        this.showNewSessionModal = true;
    }

    get smallForm() {
        return FORM_FACTOR === 'Small';
    }

    get showNewTreatmentSessionButton(){
        return (this.treatmentPlan != 'noPlan') ? true : false;
    }


    /*********** Custom Lookup component code ***********/
    customLookupNewId;
    tempTreatmentBundle
    customLookupClearSelection = true;

    customLookupEvent(event){
        this.customLookupNewId = event.detail.data.recordId;
        this.tempTreatmentBundle = event.detail.data.record;
    }

    //keeping this here because we may want to use it later, it's currenlty not needed
    handleCustomLookupExpandSearch(event){
        // let data = event.detail.data;
        // let dataId = data.elementId;
        // this.template.querySelector('[data-id="' + dataId + '"]').className =
        //     data.expandField ? 'slds-col slds-size_1-of-1' : data.initialColSize;
    }    

    get customLookupFields(){
        return ['Name'];
    }

    get customLookupDisplayFields(){
        return 'Name';
    }
}