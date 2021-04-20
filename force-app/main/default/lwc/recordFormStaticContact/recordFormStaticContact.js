import { LightningElement, api, wire } from 'lwc';

import { publish, MessageContext } from 'lightning/messageService';
import { setStale, getCachePartitions } from 'c/cacheManager';
import CACHE_MANAGER_CHANNEL from '@salesforce/messageChannel/CacheManager__c';

import ACCOUNT_FIELD from '@salesforce/schema/Contact.AccountId';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';

const CACHE_PARTITIONS = getCachePartitions();

export default class RecordFormStaticContact extends LightningElement {
    // Flexipage provides recordId and objectApiName
    @api recordId = '0034L000009dt5RQAQ'; //Arthur Song
    @api objectApiName = 'Contact';
    
    @wire(MessageContext)
    messageContext;
    
    fields = [ACCOUNT_FIELD, NAME_FIELD, TITLE_FIELD, PHONE_FIELD, EMAIL_FIELD];


    _handleSubmit () {
        setStale(CACHE_PARTITIONS.CONTACT);
        const payload = { partition: CACHE_PARTITIONS.CONTACT };
        publish(this.messageContext, CACHE_MANAGER_CHANNEL, payload);
    }
}
