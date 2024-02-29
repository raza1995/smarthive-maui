const getData = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
      .then(res => res.json())
      .then(res => resolve(res))
      .catch(err => reject(err))
    });
  }

  const setData = async (c_data, link_id, old_id='') => {
    myarr = [];
    c_data.connected_devices_details_id.filter(d => d != old_id).forEach(async (element, index, array) => {
      // c_data.connected_devices_details[index] != link_id ? 
      chart_data.findIndex(d => d.key_id == c_data.connected_devices_details_id[index]) == -1 ?
      myarr.push({
        name : c_data.connected_devices_details[index],
        value : c_data.interface_parent_device.filter(x => x.id == element).length,
        key_id: c_data.connected_devices_details_id[index],
      }) 
      : null
      if(index == 0){
        chart_data_pos = chart_data.length > 0 ? chart_data[chart_data.length -1].children.findIndex(d => d.key_id == old_id) : -1
        // console.log(chart_data_pos)
        if(chart_data_pos >= 0)
        {
          chart_data[chart_data.length -1].children[chart_data_pos].children = myarr
        } else {
          chart_data.push({
            name: c_data.device_name,
            key_id: c_data._id,
            value: c_data.total_interface_connected_with_devices,
            children : myarr,
            'linkWith' : [
            link_id
          ]
          });
        }
      }
    })

    // Get new data from
    if(chart_data.length > 0){
      let new_data = chart_data[chart_data.length -1]
      let data = new_data.children[initial];
      
      data_inner = await getData(`http://127.0.0.1:3000/api/v1/device/connections/${data.key_id}`)

      initial = initial < new_data.children.length - 1 ? initial + 1 : null 
      

      timer ? clearInterval(timer) : null;
      count++
      if(data_inner.length > 1 && initial){
          timer = count < limit || limit == -1 ? setData(data_inner[0], data.name, data.key_id) : setTimeout(fun, 1000); 
      } else {
        setTimeout(fun, 1000)
        initial = 0;
        count = 0;
        // setData(data_inner[0], data.name, data.key_id)
      }
    }
    
    // fun();
  }

  
  const intiCall = async (data) => {
    c_data = await getData(`http://127.0.0.1:3000/api/v1/device/connections/${data}`);
    if(c_data.length > 1){
      c_data = c_data[0];
      await setData(c_data, '');
    }
  } 
