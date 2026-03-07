Component({
  properties:{active:{type:String,value:'badminton'},canSwitch:{type:Boolean,value:false}},
  methods:{onBadminton(){this.triggerEvent('switch','badminton')},onTennis(){this.triggerEvent('switch','tennis')}}
})