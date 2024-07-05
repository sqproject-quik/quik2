(function(){
    var fcF=util.element('div',{
        class:"fcard-frame"
    });
    fcF.addEventListener('click',function(e){
        e.stopPropagation()
    })
    document.querySelector('main').append(fcF);

    var idmax=0;
    var fcards=[];

    function fcard(options){
        this.content=options.content;
        idmax++;
        this.id=idmax;
        var fel=util.element('div',{
            class:"fcard"
        });
        fel.innerHTML='<div class="content '+(options.class||"")+'">'+this.content+'<div><div class="cover"></div>';
        fcF.insertBefore(fel,fcF.firstChild);
        this.el=fel;
        fcards.push(this);
        this.isShow=true;
        mobZDIcon.style.display='';
    }

    fcard.prototype={
        show:function(){
            this.el.style.display='block';
            this.isShow=true;
            mobZDIcon.style.display='';
        },
        hide:function(){
            this.el.style.display='none';
            this.isShow=false;
            if(checkAllHide()){
                mobZDIcon.style.display='none';
            };
        },
        getFCardDom:function(){
            return this.el
        },
        destroy:function(){
            this.el.remove();
            this.el=null;
            fcards.splice(fcards.indexOf(this),1);
            if(checkAllHide()){
                mobZDIcon.style.display='none';
            };
        }
    }

    fcard.getFCardById=function(id){
        for(var i=0;i<fcards.length;i++){
            if(fcards[i].id==id){
                return fcards[i];
            }
        }
        return null;
    }


    function checkAllHide(){
        for(var i=0;i<fcards.length;i++){
            if(fcards[i].isShow){
                return false;
            }
        }
        return true;
    }

    var mobZDIcon=util.element('div',{
        class:"fcard-mob-zd"
    });
    mobZDIcon.innerHTML=util.getGoogleIcon('e5cc');
    mobZDIcon.style.display='none';
    document.querySelector('main').append(mobZDIcon);
    mobZDIcon.onclick=function(e){
        e.stopPropagation();
        fcF.classList.add('show')
        this.classList.add('hide');
    }
    document.addEventListener('click',function(){
        fcF.classList.remove('show');
        mobZDIcon.classList.remove('hide');
    })



    return fcard;
})();