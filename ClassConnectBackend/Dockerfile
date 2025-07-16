# Use the official .NET 9.0 SDK to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY ClassConnectBackend.csproj ./
RUN dotnet restore

# Copy the rest of the source code
COPY . ./

# Build the app in Release mode
RUN dotnet publish -c Release -o /out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy the published output from the build image
COPY --from=build /out ./

# Expose the port your app runs on 
EXPOSE 5082

# Run the app
ENTRYPOINT ["dotnet", "ClassConnectBackend.dll"]
