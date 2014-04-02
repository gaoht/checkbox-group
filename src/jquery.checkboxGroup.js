/**
 * used to create checkbox group(parent, child)
 * can be used for nested group
 */
(function($){
    function CheckboxModel(data){
        this.data = data;
    }
    //from checkbox to checkAll
    CheckboxModel.prototype.check = function(checked, silence){
        this.data.checked = checked;
        !silence &&  $(this).triggerHandler("check", checked);
    }
    //from checkAll to checkbox
    CheckboxModel.prototype.set = function(checked, silence){
        this.data.checked = checked;
        !silence &&  $(this).triggerHandler("set", [checked]);
    }
    function CheckboxView(checkbox, model){
        $(checkbox)[0].checked =  !!model.data.checked;
        $(checkbox).on("click.CheckboxView", function(){
            model.check(this.checked);
        });
        $(model).on("set", function(e, checked){
            checkbox.checked = checked;
            if($(checkbox).data("CheckCollection")){
                $(checkbox).data("CheckCollection").setAll(checked);
            }
        });
        $(checkbox).data("CheckboxView", model);
    }
    function CheckCollection(data){
        this.models = [];
        this.length = 0;
        var _self = this;
        $.each(data, function(){
            _self.add(this);
        })
    }
    CheckCollection.prototype.add = function(data){
        var _self = this;
        var model = new CheckboxModel(data);
        this.models.push(model);
        $(model).on("check", function(){
            $(_self).trigger("check", [_self.remaining() === 0]);
        })
        this.length = this.models.length;
    }
    CheckCollection.prototype.remaining = function(){
        var remaining = 0;
        $.each(this.models, function(){
            if(!this.data.checked)
                remaining++;
        })
        return remaining;
    }
    CheckCollection.prototype.toggleAll = function(){
        if(this.length){
            var checked = this.models[0].data.checked;
            $.each(this.models, function(){
                this.set(!checked);
            });
        }
    }
    CheckCollection.prototype.setAll = function(checked){
        if(this.length){
            $.each(this.models, function(){
                this.set(checked);
            });
        }
    }
    CheckCollection.prototype.each = function(callback){
        $.each(this.models, callback);
    }
    function createCheckApp(checkAll, checkboxes, data){
        var collection = new CheckCollection(data);
        //release the collections in memory which is owned by the listeners ;
        $(checkboxes).off("click.CheckboxView");
        $(checkboxes).removeData("CheckboxView");
        $(checkAll).off("click.CheckApp");
        $(checkAll).removeData("CheckCollection");

        $(collection).on("check", function(e, checked){
            $(checkAll)[0].checked = checked;
            if($(checkAll).data("CheckboxView")){
                $(checkAll).data("CheckboxView").check(checked);
            }
        });
        if(collection.remaining() === 0)
            $(checkAll)[0].checked = true;

        collection.each(function(i){
            new CheckboxView($(checkboxes)[i], this);
        })

        $(checkAll).on("click.CheckApp", function(){
            collection.setAll(this.checked);
        })
        $(checkAll).data("CheckCollection", collection);
    }
    $.checkboxGroup = createCheckApp;
})(jQuery);