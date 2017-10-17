var eCobweb = eCobweb || {};
eCobweb.QuestionClient = eCobweb.QuestionClient || {};

eCobweb.QuestionClient.QuestionBox = (function () {
    function QuestionBox() {
        var self = this;
        var questionnaireBox = $("#questionnaire-box");
        var questionBox = $("#question-box");
        var qText = $("#qb-text");
        var qOptions = $("#qb-options");
        
        self.questionCovers = ko.observableArray();       
        self.questionnarieName = ko.observable('');
        self.userName = ko.observable('');
        self.questionnaireID = ko.observable();
        self.questions = ko.observableArray();
        self.questionnaireMessage = ko.observable('');
        self.current = ko.observable(-1);   // current question
    
        self.dicOptions = [];   //key - value: (qNO - optIndex) 

        self.currentVersion = ko.observable('');
        
        self.initCovers = function(_covers){
            self.questionCovers(JSON.parse(_covers));            
            
        }
        
        self.enterQuestionBox = function(_qnID){
             var result = winObj.getQuestionnaire(_qnID);
              
             var user = winObj.getCurrentUser();   

             self.init(result, user);
                
             //self.resizePage();
        }

        self.resetOperation = function(){
             //reset
            self.current(-1);  
            self.dicOptions = [];

        }

        self.init = function (_questionnaire, _user) {
            questionnaireBox.slideUp();
            var questionnaire = JSON.parse(_questionnaire);

            self.questionnarieName(questionnaire.Name);
            self.questionnaireID(questionnaire.QuestionnaireID);
            self.questions(questionnaire.Questions);
            self.userName(_user);
            self.questionnaireMessage(questionnaire.Message);
    
            self.resetOperation();
            
            self.Next();
        }       
        
        self.headText = ko.computed(function(){

            return self.current() < 0 ? "请选择问卷开始" : "正在进行："+self.questionnarieName()+(self.userName() === '' ? "(未知人员)": "<span>( "+self.userName()+" )</span>");

        });        
        
        self.cardUser = function(_user){
            if(_user != ''){
                self.userName(_user);
            }
        }
        
        self.isMessageVisiable = ko.computed(function(){
            return self.questionnaireMessage() != '';
        });        

        self.QuestionText = ko.computed(function(){
            if(self.current() < 0 || self.questions().length < 1) {

                return '';
            }
            
            var len = self.questions().length;      
            var curr = self.current() +1;
            return "("+curr+"/"+len+") "+ self.questions()[self.current()].Text;
        });

        self.Options = ko.computed(function(){
            
            if(self.current() < 0 || self.questions().length < 1) {

                return [];
            }
            
            return self.questions()[self.current()].Options;
        });        
        
        self.Next = function(){
            if((self.current()  + 1) >= self.questions().length){
                self.finish();
                return;
            }
             var canNext = false;

             $.each(qOptions.find('button'),function(idx,btn){

                    if($(this).hasClass('btn-primary')){
                        
                       canNext = true;                         
                       
                       return false;
                    }

                });
            
            if(self.current() < 0 || canNext){            

                 self.current(self.current() + 1);
            }else{

                self.setTips('请选择');    

            }
            
            

        };       

        self.Prev = function(){
    
            if(self.current() > 0){

                self.current(self.current() - 1);
            }
        }
        
        self.nextEnable = ko.computed(function(){

            return (self.current() + 1) < self.questions().length;
        });

        
        self.prevEnable = ko.computed(function(){

            return self.current() > 0;
        });

        self.boxEnable = ko.computed(function(){
            return self.current() > -1
        });

        self.homeBoxEnable = ko.computed(function(){
            return self.current() < 0
        });
        
        self.checkOption = function(opt){
            return function(opt){
                var key = self.questions()[self.current()].NO;
                
                var optIndex = -1;
                $.each(self.questions()[self.current()].Options,function(idx,item){
                    optIndex++;

                    if(opt === item){
                    
                        return false;
                    
                    }
                    
                });
                
                self.dicOptionsAdd(key,optIndex);
                
                //set checked css
                $.each(qOptions.find('button'),function(idx,btn){
                    if(idx != optIndex){
                        $(this).addClass('btn-info').removeClass('btn-primary');
                    }else{
                        $(this).removeClass('btn-info').addClass('btn-primary');                    
                    }
                });
                
                //auto next
                self.Next();
            }
        }
       

        self.isChecked = function(optIndex){
            var key = self.questions()[self.current()].NO;
            
            return self.dicOptionsContains(key,optIndex());
        }
        
        self.dicOptionsContains = function(_key,_val){
            if(self.dicOptions.length < 1) return false;
                   
            return  self.dicOptions.find(function(ele){return ele.key === _key && ele.val === _val;}) != undefined;
            
        }
        
        self.dicOptionsContainKey = function(_key){
            if(self.dicOptions.length < 1) return false;

            return  self.dicOptions.find(function(ele){return ele.key === _key;}) != undefined;
        }

        self.dicOptionsAdd = function(_key,_val){
            if(!self.dicOptionsContainKey(_key)){
                self.dicOptions.push({'key':_key,'val':_val});
            }
            else{
                
                for( i = 0; i< self.dicOptions.length; i++){
                    if(self.dicOptions[i].key === _key){
                        self.dicOptions[i].val = _val;
                        return;
                    }
                }
            }
        }
        self.backEnable = ko.computed(function(){
            return self.current() > -1;            
        });
        
        self.backtohome = function(){
            questionnaireBox.slideDown();
            questionBox.slideUp();

             self.resetOperation();
            
            self.questionnaireMessage('')
        }
        
        self.setTips = function(_text){
            $("#tip-message").html(_text);
            $("#user-tips").modal('show');
        } 

        self.closeTips = function(){
             $("#tip-message").html('');
            $("#user-tips").modal('hide');
        }           
        
        self.qSizeInc = function(){
            
            var size = qText.css('font-size');
            
            size = size.replace('px','');

            size++;

            qText.css({"font-size":size+'px'});
        
        }
        
        self.qSizeDec = function(){
            var size = qText.css('font-size');
            
            size = size.replace('px','');

            size = size < 12? 12 : size - 1;

            qText.css({"font-size":size+'px'});
        }
        
        self.coverscss = ko.computed(function(){
            if(self.questionCovers().length > 6){
                return 'covercss';
            }
            return '';            
        });        

        self.optioncss = ko.computed(function(){
            if(self.Options().length > 6){
                return 'optioncss';
            }
            return '';            
        });

        self.resizePage = function(){
            var parentFormHeight = winObj.getMainFormHeight();

            var htmlHeight = $("#htmlBox").height();
            
            console.log('-'+parentFormHeight+','+ htmlHeight +'-');
                
            var isResized  = parentFormHeight < htmlHeight;

            //$("#htmlBox").css({"height": isResized? parentFormHeight + "px" : "auto","overflow-y": isResized ? "scroll": "auto"});

        };
        


        
        self.isCompleted = function(){
            return self.dicOptions.length > 0 && (self.dicOptions.length + 1 >= self.questions().length);
        }
            
        self.finish = function(){
            if(self.isCompleted()){
                //complete
                var resultOptions = {'QuestionnaireID' : self.questionnaireID(), 'Options':self.dicOptions};

                var result = JSON.parse(winObj.finishQuestionnaire(resultOptions));
                
                $("#result-message").html(result.message);

                $("#user-info-flyout").modal('show');
                
                if(result.code === 1){
                    self.backtohome();
                }
            }else{
                
                self.setTips('尚有未完成的答题, 不能完成本次评估');
            }
        }

       self.print = function(){
             self.setTips('正在打印..');

             var result =  winObj.printReport();
             
            //close for whatever happens
            //self.closeTips();
            self.setTips(result=="p.ok"?"打印完成.":result);
            
       }

       //--------------------------------------------------------------------------------------------//
       self.currentUpdateVersion = ko.computed(function(){
             
            var version = winObj.getUpdateVersionNum();
            
            self.currentVersion(version);
       });
      
       self.checkUpdate = function(){
            
            winObj.checkUpdate();
       }
    };
    
    return QuestionBox;

})();