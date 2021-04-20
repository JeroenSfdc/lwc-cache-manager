public with sharing class CacheManager {
    
    public class Partition {
        public String name;
        public Integer interval;
        public Boolean stale;
        public Double timestamp;

        public Partition(String partition, Integer interval) {
            this.stale = false;
            this.name = partition;
            this.interval = interval;
            this.timestamp = 0; 
        }
    }

    public class Subscriber {
        public String name;
        public String partition;

        public Subscriber(String subscriber, String partition) {
            this.name = subscriber;
            this.partition = partition;
        }
    }

    @AuraEnabled(cacheable=true)
        public static String getPartitions() {
        
        List<Partition> lstPartition = new List<Partition>();

        for (Partition__mdt p : [SELECT DeveloperName, Interval__c FROM Partition__mdt]) {
            lstPartition.add(new Partition(p.DeveloperName, (Integer)p.Interval__c));
        }
                                     
        return JSON.serialize(lstPartition);
    }

    @AuraEnabled(cacheable=true)
    public static String getSubscribers() {
  
        List<Subscriber> lstSubscriber = new List<Subscriber>();

        for (CacheManager__mdt cm : [SELECT Subscriber__c, Partition__r.DeveloperName FROM CacheManager__mdt]) {
            lstSubscriber.add(new Subscriber(cm.Subscriber__c, cm.Partition__r.DeveloperName));
        }

        return JSON.serialize(lstSubscriber);
    }
}