/**
 * Embedded repository of all Java + JavaFX source code and Maven project configurations.
 * Used for in-browser inspection, live syntax copying, and 1-click ZIP packaging.
 */

export interface JavaSourceFile {
  path: string;
  name: string;
  category: 'core' | 'map' | 'buildings' | 'tick' | 'application' | 'policies' | 'ui' | 'config' | 'test';
  language: 'java' | 'xml' | 'css' | 'markdown' | 'bash';
  code: string;
}

export const JAVA_PROJECT_FILES: JavaSourceFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'config',
    language: 'xml',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.citylogic</groupId>
    <artifactId>citylogic-javafx</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>CityLogic JavaFX</name>
    <description>Interactive City Building &amp; Simulation Engine with JavaFX GUI</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <javafx.version>21.0.2</javafx.version>
        <junit.version>5.10.2</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-controls</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-fxml</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-graphics</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.openjfx</groupId>
                <artifactId>javafx-maven-plugin</artifactId>
                <version>0.0.8</version>
                <configuration>
                    <mainClass>com.citylogic.Main</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/java/com/citylogic/ui/CityLogicApp.java',
    name: 'CityLogicApp.java',
    category: 'ui',
    language: 'java',
    code: `package com.citylogic.ui;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 * Main JavaFX Application launcher for CityLogic.
 */
public class CityLogicApp extends Application {
    @Override
    public void start(Stage primaryStage) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/citylogic/ui/GameView.fxml"));
            Parent root = loader.load();

            Scene scene = new Scene(root, 1280, 820);
            scene.getStylesheets().add(getClass().getResource("/com/citylogic/ui/styles.css").toExternalForm());

            primaryStage.setTitle("CityLogic — Municipal Simulation & Spatial Planner (JavaFX)");
            primaryStage.setMinWidth(1080);
            primaryStage.setMinHeight(720);
            primaryStage.setScene(scene);
            primaryStage.show();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to start CityLogic JavaFX Application: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}`
  },
  {
    path: 'src/main/java/com/citylogic/ui/CityMapCanvas.java',
    name: 'CityMapCanvas.java',
    category: 'ui',
    language: 'java',
    code: `package com.citylogic.ui;

import com.citylogic.application.BuildingCatalog;
import com.citylogic.domain.buildings.BuildingDescription;
import com.citylogic.domain.buildings.IBuildingState;
import com.citylogic.domain.core.Dimension;
import com.citylogic.domain.core.Point;
import com.citylogic.domain.map.IGridReadPort;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.Stop;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.TextAlignment;

/**
 * Custom JavaFX Canvas rendering the urban simulation grid, terrain,
 * placed buildings, hover shadows, and selection highlights.
 */
public class CityMapCanvas extends Canvas {
    private static final int TILE_SIZE = 54;
    private static final int PADDING = 24;

    private IGridReadPort gridReader;
    private BuildingCatalog catalog;

    private Point selectedPoint = null;
    private Point hoverPoint = null;
    private String activeTool = "select";

    public CityMapCanvas() {
        super(750, 580);
        widthProperty().addListener(evt -> redraw());
        heightProperty().addListener(evt -> redraw());
    }

    public void init(IGridReadPort gridReader, BuildingCatalog catalog) {
        this.gridReader = gridReader;
        this.catalog = catalog;
        updateCanvasDimensions();
        redraw();
    }

    public void setActiveTool(String tool) {
        this.activeTool = tool;
        redraw();
    }

    public void setSelectedPoint(Point point) {
        this.selectedPoint = point;
        redraw();
    }

    public void setHoverPoint(Point point) {
        this.hoverPoint = point;
        redraw();
    }

    public Point getGridCoordinatesFromPixel(double pixelX, double pixelY) {
        if (gridReader == null) return null;
        Dimension dim = gridReader.getDimensions();

        double totalGridWidth = dim.getWidth() * TILE_SIZE;
        double totalGridHeight = dim.getHeight() * TILE_SIZE;
        double startX = Math.max(PADDING, (getWidth() - totalGridWidth) / 2.0);
        double startY = Math.max(PADDING, (getHeight() - totalGridHeight) / 2.0);

        int gx = (int) Math.floor((pixelX - startX) / TILE_SIZE);
        int gy = (int) Math.floor((pixelY - startY) / TILE_SIZE);

        if (gridReader.isWithinBounds(gx, gy)) {
            return new Point(gx, gy);
        }
        return null;
    }

    private void updateCanvasDimensions() {
        if (gridReader == null) return;
        Dimension dim = gridReader.getDimensions();
        double requiredWidth = dim.getWidth() * TILE_SIZE + PADDING * 2;
        double requiredHeight = dim.getHeight() * TILE_SIZE + PADDING * 2;
        setWidth(Math.max(700, requiredWidth));
        setHeight(Math.max(540, requiredHeight));
    }

    public void redraw() {
        GraphicsContext gc = getGraphicsContext2D();
        double w = getWidth();
        double h = getHeight();

        gc.setFill(Color.web("#0f172a"));
        gc.fillRect(0, 0, w, h);

        if (gridReader == null) return;
        Dimension dim = gridReader.getDimensions();
        double totalGridWidth = dim.getWidth() * TILE_SIZE;
        double totalGridHeight = dim.getHeight() * TILE_SIZE;
        double startX = Math.max(PADDING, (w - totalGridWidth) / 2.0);
        double startY = Math.max(PADDING, (h - totalGridHeight) / 2.0);

        // Ground shadow
        gc.setFill(Color.web("#1e293b", 0.6));
        gc.fillRoundRect(startX - 6, startY - 6, totalGridWidth + 12, totalGridHeight + 12, 16, 16);

        // Grid tiles
        for (int x = 0; x < dim.getWidth(); x++) {
            for (int y = 0; y < dim.getHeight(); y++) {
                double tx = startX + x * TILE_SIZE;
                double ty = startY + y * TILE_SIZE;
                boolean alt = (x + y) % 2 == 0;
                gc.setFill(alt ? Color.web("#1e293b") : Color.web("#162032"));
                gc.fillRoundRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6, 6);
                gc.setStroke(Color.web("#334155", 0.4));
                gc.setLineWidth(1);
                gc.strokeRoundRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6, 6);
            }
        }

        // Buildings
        for (IBuildingState building : gridReader.getAllBuildings()) {
            drawBuilding(gc, building, startX, startY);
        }
    }

    private void drawBuilding(GraphicsContext gc, IBuildingState building, double startX, double startY) {
        Point pos = building.getPosition();
        BuildingDescription desc = building.getDescription();
        Dimension foot = desc.getFootprint();

        double bx = startX + pos.getX() * TILE_SIZE + 3;
        double by = startY + pos.getY() * TILE_SIZE + 3;
        double bw = foot.getWidth() * TILE_SIZE - 6;
        double bh = foot.getHeight() * TILE_SIZE - 6;

        Color baseColor = Color.web("#15803d");
        Color strokeColor = Color.web("#22c55e");
        String iconSymbol = "🏠";

        switch (desc.getCategory()) {
            case COMMERCIAL: baseColor = Color.web("#0369a1"); strokeColor = Color.web("#38bdf8"); iconSymbol = "🏢"; break;
            case INDUSTRIAL: baseColor = Color.web("#b45309"); strokeColor = Color.web("#f59e0b"); iconSymbol = "🏭"; break;
            case CIVIC: baseColor = Color.web("#047857"); strokeColor = Color.web("#34d399"); iconSymbol = "🌲"; break;
            case UTILITY: baseColor = Color.web("#6d28d9"); strokeColor = Color.web("#a855f7"); iconSymbol = "⚡"; break;
            default: break;
        }

        LinearGradient gradient = new LinearGradient(0, 0, 0, 1, true, CycleMethod.NO_CYCLE,
            new Stop(0, baseColor.brighter()), new Stop(1, baseColor));
        gc.setFill(gradient);
        gc.fillRoundRect(bx, by, bw, bh, 10, 10);
        gc.setStroke(strokeColor);
        gc.setLineWidth(2);
        gc.strokeRoundRect(bx, by, bw, bh, 10, 10);

        gc.setFont(Font.font("Segoe UI Emoji, Arial", FontWeight.BOLD, foot.getWidth() > 1 ? 24 : 18));
        gc.setTextAlign(TextAlignment.CENTER);
        gc.setFill(Color.WHITE);
        gc.fillText(iconSymbol, bx + bw / 2.0, by + bh / 2.0 + 2);
    }
}`
  },
  {
    path: 'src/main/java/com/citylogic/domain/tick/SimulationEngine.java',
    name: 'SimulationEngine.java',
    category: 'tick',
    language: 'java',
    code: `package com.citylogic.domain.tick;

import com.citylogic.application.ICityEventPublisher;
import com.citylogic.application.policies.IPolicyStrategy;
import com.citylogic.domain.core.CityAggregate;
import com.citylogic.domain.core.CitySnapshot;
import com.citylogic.domain.core.ResourceDelta;
import com.citylogic.domain.map.IGridReadPort;

import java.util.Collections;
import java.util.List;

/**
 * Core simulation orchestrator executing discrete transactional ticks.
 * Guarantees all-or-nothing rollback if invariants fail.
 */
public class SimulationEngine {
    private final CityAggregate cityState;
    private final IGridReadPort gridReader;
    private final ICityEventPublisher eventPublisher;
    private final List<ITickPhase> phases;
    private final PolicyEvaluationPhase policyPhase;
    private ResourceDelta lastDelta = ResourceDelta.zero();

    public SimulationEngine(
            CityAggregate cityState,
            IGridReadPort gridReader,
            ICityEventPublisher eventPublisher,
            SimulationConfig config) {
        this.cityState = cityState;
        this.gridReader = gridReader;
        this.eventPublisher = eventPublisher;

        SimulationConfig.PhasePipeline pipeline = SimulationConfig.createPipeline(
            config != null ? config : SimulationConfig.defaultConfig()
        );
        this.phases = pipeline.getPhases();
        this.policyPhase = pipeline.getPolicyPhase();
    }

    public synchronized TickResult advanceTick() throws SimulationException {
        // 1. Transactional state snapshot
        CitySnapshot startSnapshot = cityState.exportSnapshot();

        // 2. Execute discrete phases
        ResourceDelta totalDelta = ResourceDelta.zero();
        for (ITickPhase phase : phases) {
            ResourceDelta phaseDelta = phase.execute(startSnapshot, gridReader);
            if (phaseDelta != null) {
                totalDelta = totalDelta.merge(phaseDelta);
            }
        }

        // 3. Commit delta or rollback
        try {
            cityState.applyDelta(totalDelta);
        } catch (Exception err) {
            cityState.restoreFromSnapshot(startSnapshot);
            throw new SimulationException("Simulation Tick Failed (Rolled back): " + err.getMessage(), err);
        }

        CitySnapshot committedSnapshot = cityState.exportSnapshot();
        this.lastDelta = totalDelta;
        eventPublisher.publish(committedSnapshot, totalDelta);

        return new TickResult(committedSnapshot, totalDelta);
    }

    public synchronized CitySnapshot getCurrentSnapshot() {
        return cityState.exportSnapshot();
    }

    public synchronized void activatePolicy(IPolicyStrategy policy) {
        if (policyPhase != null) policyPhase.activatePolicy(policy);
    }

    public synchronized void deactivatePolicy(String policyName) {
        if (policyPhase != null) policyPhase.deactivatePolicy(policyName);
    }

    public static final class TickResult {
        private final CitySnapshot snapshot;
        private final ResourceDelta delta;

        public TickResult(CitySnapshot snapshot, ResourceDelta delta) {
            this.snapshot = snapshot;
            this.delta = delta;
        }

        public CitySnapshot getSnapshot() { return snapshot; }
        public ResourceDelta getDelta() { return delta; }
    }
}`
  },
  {
    path: 'src/main/java/com/citylogic/domain/core/CityAggregate.java',
    name: 'CityAggregate.java',
    category: 'core',
    language: 'java',
    code: `package com.citylogic.domain.core;

/**
 * Aggregate Root for global city state (DDD pattern).
 * Strictly guards bankruptcy bounds and population non-negativity.
 */
public class CityAggregate {
    public static final double MIN_BUDGET = -10000.0;
    public static final double MIN_HAPPINESS = 0.0;
    public static final double MAX_HAPPINESS = 100.0;

    private double budget;
    private double pollution;
    private int population;
    private double happiness;
    private int tickCount;

    public CityAggregate(double initialBudget, int initialPopulation, double initialHappiness) {
        this.budget = initialBudget;
        this.pollution = 0.0;
        this.population = initialPopulation;
        this.happiness = clamp(initialHappiness);
        this.tickCount = 0;
        validateInvariants();
    }

    public synchronized void applyDelta(ResourceDelta delta) {
        if (delta == null) delta = ResourceDelta.zero();

        double nextBudget = this.budget + delta.getBudgetDelta();
        double nextPollution = Math.max(0.0, this.pollution + delta.getPollutionDelta());
        int nextPopulation = this.population + delta.getPopulationDelta();
        double nextHappiness = clamp(this.happiness + delta.getHappinessDelta());

        if (nextBudget < MIN_BUDGET) {
            throw new IllegalStateException("City bankrupt: budget $" + nextBudget + " < " + MIN_BUDGET);
        }
        if (nextPopulation < 0) {
            throw new IllegalStateException("Population cannot be negative: " + nextPopulation);
        }

        this.budget = nextBudget;
        this.pollution = nextPollution;
        this.population = nextPopulation;
        this.happiness = nextHappiness;
        this.tickCount++;
    }

    public synchronized CitySnapshot exportSnapshot() {
        return new CitySnapshot(this.budget, this.pollution, this.population, this.happiness, this.tickCount);
    }

    public synchronized void restoreFromSnapshot(CitySnapshot snapshot) {
        this.budget = snapshot.getBudget();
        this.pollution = snapshot.getPollution();
        this.population = snapshot.getPopulation();
        this.happiness = snapshot.getHappiness();
        this.tickCount = snapshot.getTickCount();
    }

    private void validateInvariants() {
        if (this.budget < MIN_BUDGET) throw new IllegalStateException("Budget below minimum");
        if (this.population < 0) throw new IllegalStateException("Population cannot be negative");
    }

    private static double clamp(double v) {
        return Math.min(MAX_HAPPINESS, Math.max(MIN_HAPPINESS, v));
    }
}`
  },
  {
    path: 'src/main/java/com/citylogic/application/GameEngine.java',
    name: 'GameEngine.java',
    category: 'application',
    language: 'java',
    code: `package com.citylogic.application;

import com.citylogic.domain.buildings.BuildingDescription;
import com.citylogic.domain.buildings.IBuildingState;
import com.citylogic.domain.core.CitySnapshot;
import com.citylogic.domain.map.IGridCommandPort;
import com.citylogic.domain.map.IGridReadPort;
import com.citylogic.domain.tick.SimulationEngine;
import com.citylogic.domain.tick.SimulationException;

/**
 * Application service facade coordinating construction, demolition,
 * time ticks, and presentation queries.
 */
public class GameEngine {
    private final IGridCommandPort mapCommander;
    private final IGridReadPort gridReader;
    private final SimulationEngine simulationEngine;
    private final BuildingCatalog catalog;
    private final PlacementValidator validator;

    public GameEngine(
            IGridCommandPort mapCommander,
            IGridReadPort gridReader,
            SimulationEngine simulationEngine,
            BuildingCatalog catalog,
            PlacementValidator validator) {
        this.mapCommander = mapCommander;
        this.gridReader = gridReader;
        this.simulationEngine = simulationEngine;
        this.catalog = catalog;
        this.validator = validator;
    }

    public PlacementResult placeBuilding(int x, int y, String typeId, boolean enforceBudget) {
        BuildingDescription desc = catalog.getByTypeId(typeId);
        if (desc == null) return PlacementResult.failure("Unknown building: " + typeId);
        if (!validator.canPlace(x, y, typeId, gridReader)) return PlacementResult.failure("Tile occupied or out of bounds");

        CitySnapshot snapshot = simulationEngine.getCurrentSnapshot();
        if (enforceBudget && snapshot.getBudget() < desc.getConstructionCost()) {
            return PlacementResult.failure("Insufficient funds ($" + desc.getConstructionCost() + ")");
        }

        IBuildingState building = mapCommander.constructBuildingAt(x, y, desc);
        if (enforceBudget && desc.getConstructionCost() > 0) {
            simulationEngine.loadState(new CitySnapshot(
                snapshot.getBudget() - desc.getConstructionCost(),
                snapshot.getPollution(), snapshot.getPopulation(),
                snapshot.getHappiness(), snapshot.getTickCount()
            ));
        }
        return PlacementResult.success(building);
    }

    public DemolitionResult demolishBuilding(int x, int y) {
        IBuildingState removed = mapCommander.removeBuildingAt(x, y);
        if (removed == null) return DemolitionResult.failure("No building at (" + x + "," + y + ")");
        return DemolitionResult.success(removed);
    }

    public SimulationEngine.TickResult advanceTime() throws SimulationException {
        return simulationEngine.advanceTick();
    }
}`
  },
  {
    path: 'src/main/resources/com/citylogic/ui/GameView.fxml',
    name: 'GameView.fxml',
    category: 'ui',
    language: 'xml',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<?import javafx.geometry.Insets?>
<?import javafx.scene.control.*?>
<?import javafx.scene.layout.*?>
<?import com.citylogic.ui.CityMapCanvas?>

<BorderPane xmlns="http://javafx.com/javafx/21" xmlns:fx="http://javafx.com/fxml/1"
            fx:controller="com.citylogic.ui.GameViewController"
            styleClass="main-container">
    <top>
        <VBox spacing="8" styleClass="header-box">
            <HBox alignment="CENTER_LEFT" spacing="16">
                <Label text="CityLogic" styleClass="brand-title" />
                <Label text="JavaFX Desktop Simulation" styleClass="brand-subtitle" />
                <Region HBox.hgrow="ALWAYS" />
                <Label fx:id="tickLabel" text="Tick #0" styleClass="badge-tick" />
            </HBox>
            <HBox spacing="14" alignment="CENTER">
                <VBox styleClass="metric-card">
                    <Label text="TREASURY" styleClass="metric-label" />
                    <Label fx:id="budgetLabel" text="$2,500" styleClass="metric-val, metric-budget" />
                </VBox>
                <VBox styleClass="metric-card">
                    <Label text="POPULATION" styleClass="metric-label" />
                    <Label fx:id="populationLabel" text="8" styleClass="metric-val, metric-pop" />
                </VBox>
                <Region HBox.hgrow="ALWAYS" />
                <Button fx:id="stepTickBtn" text="⏭ Step" styleClass="btn-step" />
                <Button fx:id="playPauseBtn" text="▶ Play" styleClass="btn-play" />
            </HBox>
        </VBox>
    </top>
    <center>
        <StackPane alignment="CENTER" styleClass="canvas-container">
            <CityMapCanvas fx:id="mapCanvas" />
        </StackPane>
    </center>
</BorderPane>`
  },
  {
    path: 'src/test/java/com/citylogic/SimulationEngineTest.java',
    name: 'SimulationEngineTest.java',
    category: 'test',
    language: 'java',
    code: `package com.citylogic;

import com.citylogic.application.*;
import com.citylogic.application.policies.*;
import com.citylogic.domain.core.*;
import com.citylogic.domain.map.Grid;
import com.citylogic.domain.tick.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SimulationEngineTest {
    private Grid grid;
    private BuildingCatalog catalog;
    private GameEngine gameEngine;

    @BeforeEach
    public void setUp() {
        grid = new Grid(new Dimension(10, 10));
        catalog = new BuildingCatalog();
        ApplicationBuildingDescriptionProvider.initDefaultCatalog(catalog);
        CityAggregate aggregate = new CityAggregate(2500.0, 0, 70.0);
        SimulationEngine sim = new SimulationEngine(aggregate, grid, new CityEventPublisher());
        gameEngine = new GameEngine(grid, grid, sim, catalog, new PlacementValidator(catalog));
    }

    @Test
    public void testConstructionDeductsBudget() {
        gameEngine.placeBuilding(2, 2, "house", true);
        assertEquals(2400.0, gameEngine.getCitySnapshot().getBudget(), 0.001);
    }

    @Test
    public void testProductionTick() throws SimulationException {
        gameEngine.placeBuilding(2, 2, "factory", false);
        SimulationEngine.TickResult tick = gameEngine.advanceTime();
        assertEquals(150.0, tick.getDelta().getBudgetDelta(), 0.001);
    }
}`
  },
  {
    path: 'JAVA_README.md',
    name: 'JAVA_README.md',
    category: 'config',
    language: 'markdown',
    code: `# CityLogic JavaFX Quickstart

## Quick Execution
\`\`\`bash
# 1. Run JavaFX application immediately with Maven:
mvn clean javafx:run

# 2. Run JUnit 5 tests:
mvn test

# 3. Package executable fat JAR:
mvn clean package
java -jar target/citylogic-javafx-1.0.0.jar
\`\`\`
`
  }
];
