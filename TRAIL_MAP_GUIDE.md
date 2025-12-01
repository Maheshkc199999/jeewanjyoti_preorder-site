# Trail Map Feature - User Guide

## Overview
A new **Activity Trail Map** component has been added to the bottom of your Profile page. This feature allows you to track and visualize your movement trail by adding GPS coordinates (latitude and longitude).

## Features

### 1. **Add Trail Points**
- Enter latitude and longitude coordinates in the input fields
- Click "Add Point" to add the location to your trail
- Example coordinates for Nepal:
  - Kathmandu: Lat: 27.7172, Lng: 85.3240
  - Pokhara: Lat: 28.2096, Lng: 83.9856
  - Chitwan: Lat: 27.5291, Lng: 84.3542

### 2. **Interactive Map**
- View all your trail points on an interactive OpenStreetMap
- Trail points are connected with a green line showing your path
- Click on any marker to see details and remove individual points
- Map automatically centers on newly added points

### 3. **Trail Statistics**
- **Total Points**: Number of GPS coordinates added
- **Distance**: Approximate total distance traveled (calculated using Haversine formula)
- **Last Updated**: Timestamp of the most recent point added

### 4. **Manage Trail**
- **Remove Individual Points**: Click on a marker popup and select "Remove"
- **Clear All**: Use the "Clear All" button to delete all trail points
- **Persistent Storage**: Trail data is automatically saved in browser localStorage

## How to Use

### Adding Your First Point
1. Navigate to your Profile page
2. Scroll to the bottom to find "Activity Trail Map"
3. Enter a latitude value (e.g., 27.7172)
4. Enter a longitude value (e.g., 85.3240)
5. Click "Add Point"

### Building Your Trail
1. Continue adding more coordinates in the order you traveled
2. Each new point will be connected to the previous one
3. The map will automatically adjust to show your complete trail

### Getting GPS Coordinates
You can obtain GPS coordinates from:
- Your fitness tracker or smartwatch
- Google Maps (right-click on a location → click coordinates to copy)
- Your phone's GPS data
- Activity tracking apps

## Technical Details

### Libraries Used
- **Leaflet**: Open-source JavaScript library for interactive maps
- **React-Leaflet**: React components for Leaflet maps
- **OpenStreetMap**: Free, editable map tiles

### Data Storage
- Trail points are stored in browser localStorage
- Data persists across browser sessions
- Key: `user_trail_points`
- Format: JSON array of {lat, lng, timestamp} objects

### Distance Calculation
Distance is calculated using the Haversine formula, which determines the great-circle distance between two points on a sphere given their longitudes and latitudes.

## Example Use Cases

1. **Daily Walking Route**: Track your regular walking or jogging path
2. **Hiking Trail**: Record coordinates along a hiking trail
3. **Travel Log**: Mark locations you've visited during travel
4. **Activity Tracking**: Visualize your movement throughout the day

## Tips

- Add points in chronological order for accurate trail visualization
- Use precise coordinates (6 decimal places) for better accuracy
- The map supports zoom and pan for detailed viewing
- Trail data is stored locally, so it won't be lost when you refresh the page

## Troubleshooting

**Map not displaying?**
- Ensure you have a stable internet connection (map tiles load from OpenStreetMap servers)
- Check browser console for any errors

**Invalid coordinates error?**
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Use decimal format (not degrees/minutes/seconds)

**Trail not saving?**
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode (some browsers restrict localStorage)

## Future Enhancements (Potential)

- Import GPS data from GPX files
- Export trail data
- Add timestamps to each point
- Show elevation data
- Calculate calories burned based on distance
- Integration with fitness tracker APIs
