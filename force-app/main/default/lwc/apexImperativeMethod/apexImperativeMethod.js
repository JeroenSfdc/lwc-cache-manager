import { LightningElement, wire, } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactList';
import { refreshNeeded, updateTimestamp, getCachePartitions } from 'c/cacheManager';
import { subscribe, MessageContext } from 'lightning/messageService';
import CACHE_MANAGER_CHANNEL from '@salesforce/messageChannel/CacheManager__c';
const CACHE_PARTITIONS = getCachePartitions();
const SUBSCRIBER = 'apexImperativeMethod';

export default class ApexImperativeMethod extends LightningElement {
    contacts;
    error;
    cacheTimeStamp = new Date().getTime();
    subscription = null;
    _refreshNeeded = false;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {

        this.subscribeToMessageChannel();
        if (refreshNeeded(SUBSCRIBER)) {
            this._refreshNeeded = true;
            this.cacheTimeStamp = new Date().getTime();
        }
    }

    // Encapsulate logic for LMS subscribe.
    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            CACHE_MANAGER_CHANNEL,
            (message) => this._handleRefresh(message)
        );
    }

    // Handler for message received by component
    _handleRefresh(message) {
        if (refreshNeeded(SUBSCRIBER)) {
            this._refreshNeeded = true;
            this.cacheTimeStamp = new Date().getTime();
        }
    }

    handleLoad() {
        getContactList({'cacheTimeStamp' : this.cacheTimeStamp})
            .then((result) => {
                this.contacts = result;
                this.error = undefined;
                this._refreshNeeded = false;
                updateTimestamp(CACHE_PARTITIONS.CONTACT);
            })
            .catch((error) => {
                this.error = error;
                this.contacts = undefined;
            });
    }
}
