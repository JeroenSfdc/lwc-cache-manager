public without sharing class ApexTypesController {
 
    @AuraEnabled(cacheable=false)
    public static void updateContact(CustomWrapper wrapper) {

        Contact c = [SELECT Id, LastName FROM Contact WHERE Id =: wrapper.contactId LIMIT 1];

        if (c != null) {
            c.LastName = wrapper.lastName;
            update c;
        }
        
    }
}
