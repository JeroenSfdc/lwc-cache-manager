public with sharing class CustomWrapper {
    @TestVisible
    class InnerWrapper {
        @AuraEnabled
        public Integer someInnerInteger { get; set; }
        @AuraEnabled
        public String someInnerString { get; set; }
    }

    @AuraEnabled
    public Id contactId { get; set; }
    @AuraEnabled
    public String lastName { get; set; }
    @AuraEnabled
    public List<InnerWrapper> someList { get; set; }
}
