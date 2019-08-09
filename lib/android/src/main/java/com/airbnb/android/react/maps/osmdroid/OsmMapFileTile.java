package com.airbnb.android.react.maps.osmdroid;

import android.content.Context;
import android.support.annotation.NonNull;
import android.widget.Toast;

import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.modules.ArchiveFileFactory;
import org.osmdroid.tileprovider.modules.IArchiveFile;
import org.osmdroid.tileprovider.modules.OfflineTileProvider;
import org.osmdroid.tileprovider.tilesource.FileBasedTileSource;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.tileprovider.util.SimpleRegisterReceiver;
import org.osmdroid.views.MapView;

import java.io.File;
import java.util.Set;

public class OsmMapFileTile extends OsmMapFeature {

  private float maximumZ = 100.f;
  private float minimumZ = 0;

  public OsmMapFileTile(Context context) {
    super(context);
    Configuration.getInstance().setDebugMode(true);
  }

  @Override public void addToMap(MapView map) {
    setupMapProvider(map);
    map.setUseDataConnection(false);
    map.setTilesScaledToDpi(true);
  }

  @Override public void removeFromMap(MapView map) {
    map.setTileSource(TileSourceFactory.DEFAULT_TILE_SOURCE);
    map.setTilesScaledToDpi(true);
  }

  @Override public Object getFeature() {
    return null;
  }

  public void setMaximumZ(float maximumZ) {
    this.maximumZ = maximumZ;
  }

  public void setMinimumZ(float minimumZ) {
    this.minimumZ = minimumZ;
  }

  private void setupMapProvider(@NonNull MapView map) {
    //first we'll look at the default location for tiles that we support
    Context context = map.getContext();
    File f = new File(context.getFilesDir() + "/offline_tiles/");
    if (f.exists()) {

      File[] list = f.listFiles();
      if (list != null) {
        for (int i = 0; i < list.length; i++) {
          if (list[i].isDirectory()) {
            continue;
          }
          String name = list[i].getName().toLowerCase();
          if (!name.contains(".")) {
            continue; //skip files without an extension
          }
          name = name.substring(name.lastIndexOf(".") + 1);
          if (name.length() == 0) {
            continue;
          }
          if (ArchiveFileFactory.isFileExtensionRegistered(name)) {
            try {

              //ok found a file we support and have a driver for the format, for this demo, we'll
              // just use the first one

              //create the offline tile provider, it will only do offline file archives
              //again using the first file
              OfflineTileProvider tileProvider =
                  new OfflineTileProvider(new SimpleRegisterReceiver(map.getContext()),
                      new File[]{list[i]});

              //tell osmdroid to use that provider instead of the default rig which is (asserts,
              // cache, files/archives, online
              map.setTileProvider(tileProvider);

              //this bit enables us to find out what tiles sources are available. note, that this
              // action may take some time to run
              //and should be ran asynchronously. we've put it inline for simplicity

              String source = "";
              IArchiveFile[] archives = tileProvider.getArchives();
              if (archives.length > 0) {
                //cheating a bit here, get the first archive file and ask for the tile sources
                // names it contains
                Set<String> tileSources = archives[0].getTileSources();
                //presumably, this would be a great place to tell your users which tiles sources
                // are available
                if (!tileSources.isEmpty()) {
                  //ok good, we found at least one tile source, create a basic file based tile
                  // source using that name
                  //and set it. If we don't set it, osmdroid will attempt to use the default
                  // source, which is "MAPNIK",
                  //which probably won't match your offline tile source, unless it's MAPNIK
                  source = tileSources.iterator().next();
                  map.setTileSource(FileBasedTileSource.getSource(source));
                } else {
                  map.setTileSource(TileSourceFactory.DEFAULT_TILE_SOURCE);
                }

              } else {
                map.setTileSource(TileSourceFactory.DEFAULT_TILE_SOURCE);
              }

              Toast.makeText(map.getContext(), "Using " + list[i].getAbsolutePath() + " " +
              source,
                  Toast.LENGTH_LONG).show();
              map.invalidate();
              return;
            } catch (Exception ex) {
              ex.printStackTrace();
            }
          }
        }
      }
      Toast.makeText(map.getContext(), f.getAbsolutePath() + " did not have any files I can open! Try using MOBAC", Toast.LENGTH_LONG).show();
    } else {
      Toast.makeText(map.getContext(), f.getAbsolutePath() + " dir not found!", Toast.LENGTH_LONG).show();
    }
  }
}
