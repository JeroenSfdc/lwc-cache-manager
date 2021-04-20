import { LightningElement, api, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import CACHE_MANAGER_CHANNEL from '@salesforce/messageChannel/CacheManager__c';
import getPartitions from '@salesforce/apex/CacheManager.getPartitions';
import getSubscribers from '@salesforce/apex/CacheManager.getSubscribers';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

const SESSION_STORAGE_CACHE_PARTITION = 'cachePartition';
const SESSION_STORAGE_CACHE_SUBSCRIBER = 'cachePartitionSubscribers';

export default class CacheManager extends LightningElement {

    @api debug = false;
    _appBuilder = false;
    _cachePartitions;
    _cachePartitionSubscribers;
    _error;

    get _showCard() {
        return this.debug || this._appBuilder;
    }

    connectedCallback() {
        this._appBuilder = window.location.pathname.search('config/commeditor.jsp') > -1
        this._getPartitions();
        this._getSubscribers();
        this.subscribeToMessageChannel();
    }

    @wire(MessageContext)
    messageContext;

    /**
     * Component also subscribes to the CACHE_MANAGER_CHANNEL in case it needs to refresh record Id(s)
     */
    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            CACHE_MANAGER_CHANNEL,
            (message) => this._handleRefresh(message)
        );
    }

    _handleUpdate() {
        this._cachePartitions = fetchSessionStorage(SESSION_STORAGE_CACHE_PARTITION);
        this._cachePartitionSubscribers = fetchSessionStorage(SESSION_STORAGE_CACHE_SUBSCRIBER);
    }

    // Handles notification to LDS if one or more recordIds are present.
    _handleRefresh(message) {
        if (message.recordIds ?? false) {
            const arrNotifyChangeIds = [];
            message.recordIds.split(',').forEach(id => arrNotifyChangeIds.push({'recordId':id}));
            getRecordNotifyChange(arrNotifyChangeIds);
        }
    }

    /**
     * Getting the CacheParitition__mdt and cacheing it (cacheable=true)
     */
    _getPartitions() {
        getPartitions()
            .then((data) => {
                this._cachePartitions = JSON.parse(data);
                sessionStorage.setItem(SESSION_STORAGE_CACHE_PARTITION, data);
                this._error = null;
            })
            .catch((error) => {
                console.error('[cacheManager.getCachePartitions] error: ', error);
                this._cachePartitions = [];
                sessionStorage.setItem(SESSION_STORAGE_CACHE_PARTITION, [])
                this._error = error;
            });
        }

    /**
     * Getting the CacheManager__mdt and cacheing it (cacheable=true)
     */
    _getSubscribers() {
        getSubscribers()
            .then((data) => {
                this._cachePartitionSubscribers = JSON.parse(data);
                sessionStorage.setItem(SESSION_STORAGE_CACHE_SUBSCRIBER, data);
                this._error = null;
            })
            .catch((error) => {
                console.error('[cacheManager.getCachePartitions] error: ', error);
                this._cachePartitionSubscribers = [];
                sessionStorage.setItem(SESSION_STORAGE_CACHE_SUBSCRIBER, []);
                this._error = error;
            });
        }
}

const getCachePartitions = () =>{
    return {
        CONTACT : 'contact',
        ACCOUNT : 'account',
        WISHLIST : 'wishlist'
    }
 }

// Key being either 'cachePartitions' or 'cachePartitionSubscribers'
const updateSessionStorage = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify(data));
}

// Key being either 'cachePartitions' or 'cachePartitionSubscribers'
const fetchSessionStorage = (key) => {
    return JSON.parse(sessionStorage.getItem(key)) ?? [];
}

const refreshNeeded = (subscriber) => {
    const partitionSubscribers = fetchSessionStorage(SESSION_STORAGE_CACHE_SUBSCRIBER);
    const s = partitionSubscribers.filter(s => s.name.toLowerCase() === subscriber.toLowerCase());
    return s.length === 1 ? isStale(s[0].partition) : false;
}

const isStale = (partition) => {
    const partitions = fetchSessionStorage(SESSION_STORAGE_CACHE_PARTITION);
    const p = partitions.filter(p => p.name.toLowerCase() === partition.toLowerCase());
    return p.length === 1 ? p[0].stale || ( getAge(p[0].name)  > new Date().getTime() ) : false;
}

const getAge = (partition) => {
    const partitions = fetchSessionStorage(SESSION_STORAGE_CACHE_PARTITION);
    const p = partitions.filter(p => p.name.toLowerCase() === partition.toLowerCase());
    return p.length === 1 && p[0].timestamp > 0? new Date().getTime() - p[0].timestamp : 0;
}

const updateTimestamp = (partition) => {
    const partitions = fetchSessionStorage(SESSION_STORAGE_CACHE_PARTITION);
    partitions.filter(p => {
        if ( p.name.toLowerCase() === partition.toLowerCase() ) {
            p.timestamp = new Date().getTime();
            p.stale = false;
            updateSessionStorage(SESSION_STORAGE_CACHE_PARTITION, partitions);
        }
    });
}

const setStale = (partition) => {
    const partitions = fetchSessionStorage(SESSION_STORAGE_CACHE_PARTITION);
    partitions.filter(p => {
        if ( p.name.toLowerCase() === partition.toLowerCase() ) {
            p.stale = true;
            updateSessionStorage(SESSION_STORAGE_CACHE_PARTITION, partitions);
        }
    });
}

export { refreshNeeded, isStale, getAge, updateTimestamp, setStale, getCachePartitions };