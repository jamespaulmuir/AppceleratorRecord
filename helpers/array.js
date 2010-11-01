Array.prototype.indexOf=function(n){for(var i=0;i<this.length;i++){if(this[i]===n){return i;}}return -1;};
Array.prototype.lastIndexOf=function(n){var i=this.length;while(i--){if(this[i]===n){return i;}}return -1;};
Array.prototype.each=function(f){var i=this.length,j,l=this.length;for(i=0;i<l;i++){if((j=this[i])){f(j);}}};
Array.prototype.insert=function(i,v){if(i>=0){var a=this.slice(),b=a.splice(i);a[i]=value;return a.concat(b);}};
Array.prototype.shuffle=function(){var i=this.length,j,t;while(i--){j=Math.floor((i+1)*Math.random());t=arr[i];arr[i]=arr[j];arr[j]=t;}};
Array.prototype.unique=function(){var a=[],i;this.sort();for(i=0;i<this.length;i++){if(this[i]!==this[i+1]){a[a.length]=this[i];}}return a;};
if(typeof Array.prototype.concat==='undefined'){Array.prototype.concat=function(a){for(var i=0,b=this.copy();i<a.length;i++){b[b.length]=a[i];}return b;};};
if(typeof Array.prototype.copy==='undefined'){Array.prototype.copy=function(a){var a=[],i=this.length;while(i--){a[i]=(typeof this[i].copy!=='undefined')?this[i].copy():this[i];}return a;};};
if(typeof Array.prototype.pop==='undefined'){Array.prototype.pop=function(){var b=this[this.length-1];this.length--;return b;};};
if(typeof Array.prototype.push==='undefined'){Array.prototype.push=function(){for(var i=0,b=this.length,a=arguments;i<a.length;i++){this[b+i]=a[i];}return this.length;};};
if(typeof Array.prototype.shift==='undefined'){Array.prototype.shift=function(){for(var i=0,b=this[0];i<this.length-1;i++){this[i]=this[i+1];}this.length--;return b;};};
if(typeof Array.prototype.unshift==='undefined'){Array.prototype.unshift=function(a){this.reverse();var b=this.push(a);this.reverse();return b;};};

Array.select = function(a, fn){ var new_array = new Array(); a.each(function(e){ if(fn(e)){ new_array.push(e); } }); return new_array; };
Array.prototype.select = function(fn){ return Array.select(this, fn); };
