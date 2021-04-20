import { LightningElement, wire } from 'lwc';
import updateContact from '@salesforce/apex/ApexTypesController.updateContact';
import { publish, MessageContext } from 'lightning/messageService';
import { setStale } from 'c/cacheManager';
import CACHE_MANAGER_CHANNEL from '@salesforce/messageChannel/CacheManager__c';

export default class ApexUpdate extends LightningElement {

    _contactId;
    _lastName;

    @wire(MessageContext)
    messageContext;

    _handleContactId(event) {
        this._contactId = event.target.value;        
    }

    _handleLastName(event) {
        this._lastName = event.target.value;
    }

    _handleUpdate() {

        let parameterObject = {
            contactId: this._contactId,
            lastName: this._lastName
        };

        updateContact({ wrapper: parameterObject })
            .then((result) => {
                this.message = result;
                this.error = undefined;
                console.log('ApexUpdate CACHE_MANAGER_CHANNEL going to publish');
                const payload = { recordIds: parameterObject.contactId, partition: 'contact' };
                console.log('ApexUpdate CACHE_MANAGER_CHANNEL message published');
                setStale('contact');
                publish(this.messageContext, CACHE_MANAGER_CHANNEL, payload);
            })
            .catch((error) => {
                console.log('ApexUpdate ERROR Publishing to CACHE_MANAGER_CHANNEL', error);
                this.message = undefined;
                this.error = error;
            });
    }

}