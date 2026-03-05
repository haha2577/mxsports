Component({
  properties:{active:{type:String,value:'badminton'},sportPref:{type:String,value:''}},
  methods:{onBadminton(){this.triggerEvent('switch','badminton')},onTennis(){this.triggerEvent('switch','tennis')}}
})